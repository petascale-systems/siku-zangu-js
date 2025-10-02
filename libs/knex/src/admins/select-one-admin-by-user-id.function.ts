import {APIError} from "@siku-zangu/core";
import {DATABASE} from "../create-database.function";
import {ADMIN_TABLE_COLUMN_ALIASES, buildAdminTableJoins, rowToAdmin} from "./insert-one-admin.function";

export async function selectOneAdminByUserId(userIdHex: string) {
    const userIdBin = Buffer.from(userIdHex.replace('-', ''), 'hex')
    const row = await buildAdminTableJoins(DATABASE)
        .where('_a.id_user', userIdBin)
        .first(ADMIN_TABLE_COLUMN_ALIASES);
    if (!row) return Promise.reject({status: 404, message: 'Admin not found'} as APIError);
    return rowToAdmin(row);
}