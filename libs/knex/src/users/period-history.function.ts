import { PeriodHistoryCycle, UserKv } from '@siku-zangu/core';

/** A `period_start` / `period_end` row of `s_user_log`, as read back. */
export type PeriodLogRow = {
  kind: string;
  value: string;
  logged_at: Date;
  cleared?: boolean | number;
};

/**
 * The longest a period can run. Mirrors MAX_PERIOD_LENGTH_DAYS in
 * libs/expo/src/utils/cycle-calculations.ts, which this lib cannot import.
 */
const MAX_PERIOD_LENGTH_DAYS = 15;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from one YYYY-MM-DD to another, free of timezones. */
const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/**
 * Rebuilds a user's cycles from the period days they have marked.
 *
 * The log is every mark ever made, corrections included: re-marking the 19th
 * after the 20th leaves both rows. A period cannot begin inside the previous
 * one, so two starts closer than a period's length are the same period, and
 * the later-marked one is the user's answer.
 *
 * `prev_cycle_start_date` is authoritative for the current cycle. It is added
 * when no row carries it (a start set at onboarding, or before logging
 * existed), and any logged start after it has since been taken back.
 *
 * Returned newest first. The current cycle has no length, since it has not
 * ended; its end is whatever kv holds now, which may have been cleared.
 */
export function logsToPeriodHistory(
  rows: PeriodLogRow[],
  kv: Pick<UserKv, 'prev_cycle_start_date' | 'prev_period_end_date'>,
  limit = 12
): PeriodHistoryCycle[] {
  const marks = rows
    .filter((row) => !row.cleared && isIsoDate(row.value))
    .sort((a, b) => a.logged_at.getTime() - b.logged_at.getTime());

  // Each start with the moment it was marked; a correction replaces in place.
  let starts: string[] = [];
  for (const row of marks) {
    if (row.kind !== 'period_start') continue;
    starts = starts.filter(
      (start) => Math.abs(daysBetween(start, row.value)) >= MAX_PERIOD_LENGTH_DAYS
    );
    starts.push(row.value);
  }

  const current = isIsoDate(kv.prev_cycle_start_date) ? kv.prev_cycle_start_date : undefined;
  if (current) {
    starts = starts.filter(
      (start) =>
        start < current && daysBetween(start, current) >= MAX_PERIOD_LENGTH_DAYS
    );
    starts.push(current);
  }
  starts.sort();

  // Later marks overwrite earlier ones, so the last end matched wins.
  const ends = marks.filter((row) => row.kind === 'period_end').map((row) => row.value);

  const cycles: PeriodHistoryCycle[] = starts.map((start, i) => {
    const next = starts[i + 1];
    const isCurrent = !next && !!current;
    if (isCurrent) {
      return {
        start_date: start,
        end_date:
          isIsoDate(kv.prev_period_end_date) && kv.prev_period_end_date >= start
            ? kv.prev_period_end_date
            : null,
        cycle_length_days: null,
      };
    }
    let end: string | null = null;
    for (const candidate of ends) {
      const length = daysBetween(start, candidate) + 1;
      if (length < 1 || length > MAX_PERIOD_LENGTH_DAYS) continue;
      if (next && candidate >= next) continue;
      end = candidate;
    }
    return {
      start_date: start,
      end_date: end,
      cycle_length_days: next ? daysBetween(start, next) : null,
    };
  });

  return cycles.reverse().slice(0, Math.max(0, limit));
}
