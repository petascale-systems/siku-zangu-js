import { DATABASE } from '../create-database.function';
import { TABLE_NAME_S_USER_LOG } from '../table-names';

export type SymptomCount = {
  value: string;
  /** How many times it was logged. */
  occurrences: number;
  /** How many distinct people logged it. */
  users: number;
};

export type AnalyticsRange = {
  from?: string;
  to?: string;
  limit?: number;
};

/**
 * Symptom totals across every user.
 *
 * Replaces an in-browser loop over `useUsersPage({ size: 500 })` that had three
 * accuracy problems, all fixed here rather than carried over:
 *
 *  - It only ever counted the **first 500 users**, with nothing on screen
 *    saying so. This counts all of them.
 *  - It added `selected_symptoms` — a preference set, at most one per user —
 *    into the same tally as `symptom_logs` — events, many per user — and then
 *    took percentages of the mixed total. `occurrences` and `users` are
 *    returned separately so the two questions stay separate: "how often does
 *    this happen" and "how many people report it".
 *  - It parsed JSON per user in the browser; this is one indexed aggregate.
 */
export async function selectSymptomCounts({
  from,
  to,
  limit = 10,
}: AnalyticsRange = {}): Promise<SymptomCount[]> {
  const query = DATABASE(TABLE_NAME_S_USER_LOG)
    .where('kind', 'symptom')
    // A clearing event records that the user had none — it is not an occurrence.
    .andWhere('cleared', false)
    .groupBy('value')
    .orderBy('occurrences', 'desc')
    .limit(limit)
    .select({
      value: 'value',
      occurrences: DATABASE.raw('count(*)'),
      users: DATABASE.raw('count(distinct id_user)'),
    });

  if (from) query.andWhere('logged_at', '>=', new Date(from));
  if (to) query.andWhere('logged_at', '<', new Date(to));

  const rows = await query;
  return rows.map((row: SymptomCount) => ({
    value: row.value,
    occurrences: Number(row.occurrences),
    users: Number(row.users),
  }));
}
