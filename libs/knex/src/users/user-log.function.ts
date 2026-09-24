import { UserKv } from '@siku-zangu/core';

export type UserLogKind = 'symptom' | 'mood' | 'medication' | 'period_start' | 'period_end';

/** A row as it is written to, and read back from, `s_user_log`. */
export type UserLogRow = {
  kind: UserLogKind;
  value: string;
  logged_at: Date;
  /**
   * The user removed everything of this kind at this moment.
   *
   * A fact in its own right: "no symptoms today" is not the same as "did not
   * open the app today", and only an explicit row can tell the two apart.
   * `value` is empty on these rows because the column cannot be null.
   */
  cleared: boolean;
};

/** The log arrays a `User.kv` body can carry. */
export type UserLogs = Pick<
  UserKv,
  | 'symptom_logs'
  | 'mood_logs'
  | 'medication_logs'
  | 'period_start_logs'
  | 'period_end_logs'
>;

/** kv key ↔ kind ↔ the property name each entry uses for its value. */
export const USER_LOG_KINDS = [
  { kind: 'symptom', kvKey: 'symptom_logs', valueKey: 'symptom' },
  { kind: 'mood', kvKey: 'mood_logs', valueKey: 'mood' },
  { kind: 'medication', kvKey: 'medication_logs', valueKey: 'medication' },
  // The value is the day marked (YYYY-MM-DD); logged_at is when it was marked.
  // Never stored in kv — the current dates live in prev_cycle_start_date and
  // prev_period_end_date — so the kv backfill finds nothing for these.
  { kind: 'period_start', kvKey: 'period_start_logs', valueKey: 'date' },
  { kind: 'period_end', kvKey: 'period_end_logs', valueKey: 'date' },
] as const;

/** The furthest ahead of the server clock a client timestamp may be. */
const MAX_FUTURE_MS = 5 * 60 * 1000;

/** And the furthest behind — beyond this it is a bad clock, not history. */
const MAX_PAST_MS = 400 * 24 * 60 * 60 * 1000;



/**
 * Clamps a client-supplied timestamp, or returns null if it is unusable.
 *
 * `logged_at` comes from the device, which is what makes a retry idempotent —
 * the same entry re-sent carries the same instant and collides with the unique
 * index. That also means a wrong device clock writes wrong history, hence the
 * bounds.
 */
export function parseLoggedAt(raw: unknown, now = Date.now()): Date | null {
  if (typeof raw !== 'string' || !raw) return null;
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return null;
  if (ms > now + MAX_FUTURE_MS) return null;
  if (ms < now - MAX_PAST_MS) return null;
  return new Date(ms);
}

/**
 * Turns the `*_logs` arrays of a PATCH body into rows.
 *
 * A submission is the complete set for that moment, so the two cases differ:
 * an **absent** key means "not logging this kind at all" and is untouched,
 * while an **empty array** means "I have none of these now" and is recorded as
 * a clearing event. That is how a user who unticks their last symptom says so.
 *
 * A clear carries the server's clock, since there is no entry to take a
 * timestamp from.
 */
export function userLogsToRows(kv: UserLogs | undefined, now = Date.now()): UserLogRow[] {
  const rows: UserLogRow[] = [];
  if (!kv) return rows;

  for (const { kind, kvKey, valueKey } of USER_LOG_KINDS) {
    const entries = kv[kvKey];
    if (!Array.isArray(entries)) continue;

    if (entries.length === 0) {
      rows.push({ kind, value: '', logged_at: new Date(now), cleared: true });
      continue;
    }

    for (const entry of entries) {
      const value = (entry as Record<string, unknown>)?.[valueKey];
      const loggedAt = parseLoggedAt(
        (entry as Record<string, unknown>)?.timestamp,
        now
      );
      if (typeof value !== 'string' || !value || !loggedAt) continue;
      rows.push({
        kind,
        value: value.slice(0, 64),
        logged_at: loggedAt,
        cleared: false,
      });
    }
  }
  return rows;
}



/**
 * The `selected_*` values a PATCH should write, given the logs it carried.
 *
 * "Current is updated": logging a mood today makes it the current mood. Only
 * kinds actually present in the body are touched.
 *
 * A submission is the complete set for that moment, not an increment — the
 * client sends everything ticked at save time. So resubmitting
 * `[fatigue]` after `[fatigue, tired]` is how a user drops tired, and a
 * non-empty submission therefore REPLACES the current set rather than merging
 * into it. Anything else would make a symptom impossible to stop reporting.
 *
 * An empty array clears. Only an **absent** key leaves a kind alone, so the
 * distinction between the two is load-bearing here.
 *
 * Note the consequence for medication reminders: the cron gates on
 * `selected_medications` being non-empty
 * (`notifications/notification-schedule.ts`), so clearing medications switches
 * them off. That is the intended reading — a user who says they take nothing
 * should not keep being reminded — but it is a real side effect of a clear.
 */
export function selectedFromLogs(kv: UserLogs | undefined): Partial<UserKv> {
  const next: Partial<UserKv> = {};
  if (!kv) return next;

  for (const { kvKey, valueKey } of USER_LOG_KINDS) {
    const entries = kv[kvKey];
    // Absent means "not mentioned"; empty means "none of these now".
    if (!Array.isArray(entries)) continue;

    const values = Array.from(
      new Set(
        entries
          .map((e) => (e as Record<string, unknown>)?.[valueKey])
          .filter((v): v is string => typeof v === 'string' && !!v)
      )
    );
    if (kvKey === 'symptom_logs') next.selected_symptoms = values;
    if (kvKey === 'mood_logs') next.selected_moods = values;
    if (kvKey === 'medication_logs') next.selected_medications = values;
  }
  return next;
}
