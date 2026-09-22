import {
  USER_LOG_KINDS,
  UserLogRow,
  parseLoggedAt,
} from './user-log.function';

export type KvLogBackfill = {
  rows: UserLogRow[];
  /** kv values that could not be parsed — already truncated past recovery. */
  unparseable: number;
  /** Entries dropped for a missing value or an unusable timestamp. */
  skipped: number;
};

/**
 * Converts one user's stored kv log JSON into rows for `s_user_log`.
 *
 * Separate from `userLogsToRows` because the inputs differ in kind: a PATCH
 * body is fresh and clamped against the server clock, whereas this is historical
 * data that may be years old and must not be rejected for that. It also has to
 * survive its own corruption — the `varchar(4096)` ceiling means some stored
 * values are truncated mid-JSON, and those are unrecoverable rather than
 * skippable-and-retryable. They are counted so the migration can report what it
 * could not save instead of claiming a clean run.
 */
export function kvLogsToRows(
  kv: Record<string, string | null | undefined>
): KvLogBackfill {
  const rows: UserLogRow[] = [];
  let unparseable = 0;
  let skipped = 0;

  for (const { kind, kvKey, valueKey } of USER_LOG_KINDS) {
    const raw = kv[kvKey];
    if (raw == null || raw === '') continue;

    let entries: unknown;
    try {
      entries = JSON.parse(raw);
    } catch {
      unparseable += 1;
      continue;
    }
    if (!Array.isArray(entries)) {
      unparseable += 1;
      continue;
    }

    for (const entry of entries) {
      const value = (entry as Record<string, unknown>)?.[valueKey];
      // No clamp here: historical entries are legitimately old, and the point
      // of the backfill is to keep them.
      const rawTimestamp = (entry as Record<string, unknown>)?.timestamp;
      const ms =
        typeof rawTimestamp === 'string' ? Date.parse(rawTimestamp) : NaN;
      if (typeof value !== 'string' || !value || !Number.isFinite(ms)) {
        skipped += 1;
        continue;
      }
      rows.push({
        kind,
        value: value.slice(0, 64),
        logged_at: new Date(ms),
        // Historical kv held only entries — a clear was not expressible then.
        cleared: false,
      });
    }
  }

  return { rows, unparseable, skipped };
}

export { parseLoggedAt };
