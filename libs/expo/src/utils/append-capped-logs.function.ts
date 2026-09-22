/**
 * Every kv value is stored in a single `varchar(4096)` column, and the log
 * arrays are append-only: each save adds one entry per selected item, for
 * every day the user logs. A mood entry serialises to roughly 58 characters,
 * so the column fills after about 70 of them.
 *
 * Nothing caught that. `rowToUser` parses these columns with a bare
 * `JSON.parse`, so a truncated array throws while reading the user — the
 * symptom is not "the oldest log fell off", it is that saving and then loading
 * the account stops working altogether.
 *
 * Keeping the newest entries is the right trade: the app only ever reads the
 * most recent logging day.
 */
const COLUMN_LIMIT = 4096;

/** Headroom for the JSON delimiters and a margin against multi-byte text. */
const BUDGET = 3600;

export function appendCappedLogs<T>(existing: T[] | undefined, added: T[]): T[] {
  const combined = [...(Array.isArray(existing) ? existing : []), ...added];
  if (JSON.stringify(combined).length <= BUDGET) return combined;

  // Drop from the front — the oldest — until it fits. `added` is never dropped
  // below a single entry, so a save always records something.
  let start = 0;
  const minStart = Math.max(0, combined.length - Math.max(added.length, 1));
  while (
    start < minStart &&
    JSON.stringify(combined.slice(start)).length > BUDGET
  ) {
    start += 1;
  }
  return combined.slice(start);
}

export const LOG_COLUMN_LIMIT = COLUMN_LIMIT;
