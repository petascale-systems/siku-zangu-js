import { DATABASE } from '../create-database.function';
import { TABLE_NAME_S_USER_LOG } from '../table-names';
import { AnalyticsRange } from './select-symptom-counts.function';

export type SymptomsByDate = {
  date: string;
  value: string;
  occurrences: number;
};

/**
 * Timezone the day buckets are computed in.
 *
 * `DATE(logged_at)` would bucket in UTC, and the audience is in EAT — an
 * evening log would land on the following day's bar. Stated explicitly so the
 * choice is visible rather than inherited from the storage timezone.
 */
const REPORTING_TZ = '+03:00';

/**
 * Symptoms per day.
 *
 * This chart has never rendered anything. `trends/page.tsx` guards on
 * `if (log.date && log.symptom)`, and a log entry has only `symptom` and
 * `timestamp` — `date` has never existed, so the condition never passed. The
 * data was always there; it was being read under the wrong name.
 */
export async function selectSymptomsByDate({
  from,
  to,
}: AnalyticsRange = {}): Promise<SymptomsByDate[]> {
  const bucket = DATABASE.raw(
    `date(convert_tz(logged_at, '+00:00', ?))`,
    [REPORTING_TZ]
  );

  const query = DATABASE(TABLE_NAME_S_USER_LOG)
    .where('kind', 'symptom')
    // Clearing events are not occurrences.
    .andWhere('cleared', false)
    .groupByRaw(`date(convert_tz(logged_at, '+00:00', ?)), value`, [
      REPORTING_TZ,
    ])
    .orderBy('date', 'asc')
    .select({
      date: bucket,
      value: 'value',
      occurrences: DATABASE.raw('count(*)'),
    });

  if (from) query.andWhere('logged_at', '>=', new Date(from));
  if (to) query.andWhere('logged_at', '<', new Date(to));

  // The driver hands `DATE(...)` back as a Date on some configurations and a
  // string on others, so the row is typed as it actually arrives rather than as
  // the shape being returned.
  type RawRow = { date: Date | string; value: string; occurrences: number };

  const rows: RawRow[] = await query;
  return rows.map((row) => ({
    date:
      row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date),
    value: row.value,
    occurrences: Number(row.occurrences),
  }));
}
