import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {DATABASE} from '../create-database.function';

import {APIError} from "@siku-zangu/core";

export async function selectOneUserByUserId(userIdHex: string) {
    const userIdBin = Buffer.from(userIdHex.replace('-', ''), 'hex')
    return buildUserTableJoins(DATABASE)
        .where('_u.id_user', userIdBin)
        .first(USER_TABLE_COLUMN_ALIASES)
        .then(async (row) => {
            if (!row) return Promise.reject({status: 404, message: 'User not found'} as APIError);
            return rowToUser(row)
        })
}