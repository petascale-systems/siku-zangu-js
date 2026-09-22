import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {DATABASE} from '../create-database.function';
import {backfillOneUserLogs} from "./backfill-user-logs.function";

import {APIError} from "@siku-zangu/core";

export async function selectOneUserByUserId(userIdHex: string) {
    // `/g` matters: without it only the first hyphen of a formatted UUID is
    // removed and `Buffer.from(..., 'hex')` silently stops at the next
    // non-hex character, producing a short buffer that matches no row.
    const userIdBin = Buffer.from(userIdHex.replace(/-/g, '').toLowerCase(), 'hex')
    return buildUserTableJoins(DATABASE)
        .where('_u.id_user', userIdBin)
        .first(USER_TABLE_COLUMN_ALIASES)
        .then(async (row) => {
            if (!row) return Promise.reject({status: 404, message: 'User not found'} as APIError);
            // kv already carries the latest submission for each log key, which
            // is what the response is meant to return — s_user_log is the
            // history behind it, read only by the analytics aggregates.
            //
            // The one-time migration of a user's old kv history into that table
            // happens here, on first access, so it does not wait for the
            // boot-time sweep to reach them. Idempotent and marked, and its
            // failure must never stop a user loading.
            await backfillOneUserLogs(DATABASE, userIdBin).catch(() => undefined)
            return rowToUser(row)
        })
}
