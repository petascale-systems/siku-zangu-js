import { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { DATABASE } from '../create-database.function';
import { TABLE_NAME_S_USER_LOG } from '../table-names';
import { UserLogRow } from './user-log.function';

/**
 * Appends log rows for a user.
 *
 * `.onConflict(...).ignore()` rather than `INSERT IGNORE`: the latter also
 * swallows foreign key violations, truncation and malformed datetimes, turning
 * real failures into warnings. This suppresses key conflicts only.
 *
 * The conflict target is the unique `(id_user, kind, value, logged_at)`, which
 * is what lets a v1.1.0 client re-send its entire history on every save without
 * duplicating it — and what makes a retried request a no-op.
 *
 * Takes a `Knex` or a transaction so the caller can append inside the same
 * transaction as the rest of a PATCH.
 */
export async function insertUserLogs(
  db: Knex | Knex.Transaction,
  userIdBin: Buffer,
  rows: UserLogRow[]
): Promise<number> {
  if (!rows.length) return 0;

  await db
    .insert(
      rows.map((row) => ({
        id_log: DATABASE.fn.uuidToBin(randomUUID()),
        id_user: userIdBin,
        kind: row.kind,
        value: row.value,
        cleared: row.cleared,
        logged_at: row.logged_at,
      }))
    )
    .into(TABLE_NAME_S_USER_LOG)
    .onConflict(['id_user', 'kind', 'value', 'logged_at'])
    .ignore();

  return rows.length;
}
