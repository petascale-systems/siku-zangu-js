import { PeriodHistoryCycle } from '@siku-zangu/core';
import { DATABASE } from '../create-database.function';
import { TABLE_NAME_S_USER_LOG } from '../table-names';
import { selectOneUserByUserId } from './select-one-user-by-user-id.function';
import { logsToPeriodHistory, PeriodLogRow } from './period-history.function';

/**
 * A user's past cycles, newest first, rebuilt from the period days they have
 * marked. The user is read first so an unknown id is a 404, and because the
 * current cycle comes from kv rather than the log.
 */
export async function selectPeriodHistory(
  userIdHex: string,
  limit = 12
): Promise<PeriodHistoryCycle[]> {
  const user = await selectOneUserByUserId(userIdHex);
  const userIdBin = Buffer.from(userIdHex.replace(/-/g, '').toLowerCase(), 'hex');

  const rows: PeriodLogRow[] = await DATABASE(TABLE_NAME_S_USER_LOG)
    .where('id_user', userIdBin)
    .whereIn('kind', ['period_start', 'period_end'])
    .andWhere('cleared', false)
    .orderBy('logged_at', 'asc')
    .select('kind', 'value', 'logged_at', 'cleared');

  return logsToPeriodHistory(rows, user.kv ?? {}, limit);
}
