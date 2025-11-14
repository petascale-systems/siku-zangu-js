import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_ADMIN} from "../table-names";

export async function deleteOneAdminByUserId(userIdHex: string) {
    const userIdBin = Buffer.from(userIdHex.replace('-', ''), 'hex')
    await DATABASE.from(TABLE_NAME_S_ADMIN).delete().where('id_user', userIdBin)
}