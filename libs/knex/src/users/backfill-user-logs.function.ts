import { Knex } from 'knex';
import { TABLE_NAME_S_USER_KV } from '../table-names';
import { insertUserLogs } from './insert-user-logs.function';
import { kvLogsToRows } from './kv-logs-to-rows.function';
import { USER_LOG_KINDS } from './user-log.function';

/** Marks a user as migrated. 18 chars, inside `s_user_kv.k`'s varchar(32). */
const BACKFILL_MARKER_KEY = 'logs_backfilled_at';

const LOG_KV_KEYS = USER_LOG_KINDS.map((k) => k.kvKey);

/**
 * Copies one user's kv log history into `s_user_log`.
 *
 * The only migration path: there is no sweep over every account, so each user
 * is migrated on first access and an account nobody signs in to keeps its
 * history in `s_user_kv` alone.
 *
 * Idempotent twice over — the unique index ignores rows already present, and
 * the marker skips an account that has already been done.
 */
export async function backfillOneUserLogs(
  db: Knex | Knex.Transaction,
  userIdBin: Buffer
): Promise<{ rowsInserted: number; unparseable: number; skipped: number }> {
  const rows: Array<{ k: string; v: string }> = await db(TABLE_NAME_S_USER_KV)
    .where('id_user', userIdBin)
    .whereIn('k', [...LOG_KV_KEYS, BACKFILL_MARKER_KEY])
    .select('k', 'v');

  if (rows.some((r) => r.k === BACKFILL_MARKER_KEY)) {
    return { rowsInserted: 0, unparseable: 0, skipped: 0 };
  }

  const kv: Record<string, string> = {};
  for (const row of rows) kv[row.k] = row.v;

  const { rows: logRows, unparseable, skipped } = kvLogsToRows(kv);
  const rowsInserted = await insertUserLogs(db, userIdBin, logRows);

  await db
    .insert({
      id_user: userIdBin,
      k: BACKFILL_MARKER_KEY,
      v: new Date().toISOString(),
    })
    .into(TABLE_NAME_S_USER_KV)
    .onConflict(['id_user', 'k'])
    .merge(['v']);

  return { rowsInserted, unparseable, skipped };
}
