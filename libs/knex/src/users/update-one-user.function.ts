import {APIError, User, } from "@siku-zangu/core";
import {userToKv} from "./user-to-kv.function";
import {userExistsByUserId} from "./user-exists-by-user-id.function";
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_USER_KV} from "../table-names";

export async function updateOneUser(userIdHex: string, user: User) {
    if (!await userExistsByUserId(userIdHex)) {
        return Promise.reject({status: 404, message: 'User not found'} as APIError);
    }

    const userIdBin = Buffer.from(userIdHex.replace('-', ''), 'hex')
    const kvs = userToKv(user)
    if (kvs.length > 0) {
        await DATABASE
            .insert(kvs.map(kv => ({...kv, id_user: userIdBin})))
            .into(TABLE_NAME_S_USER_KV)
            .onConflict(['id_user', 'k'])
            .merge(['v'])
    }

    return buildUserTableJoins(DATABASE)
        .where('_u.id_user', userIdBin)
        .first(USER_TABLE_COLUMN_ALIASES)
        .then(async (row) => {
            if (!row) return Promise.reject('User UPDATEd but SELECT returns zero records')
            return rowToUser(row)
        })
}