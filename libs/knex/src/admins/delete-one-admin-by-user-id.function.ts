import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_ADMIN, TABLE_NAME_S_USER} from "../table-names";

export async function deleteOneAdminByUserId(userIdHex: string) {
    const userIdBin = Buffer.from(userIdHex.replace(/-/g, ''), 'hex')
    const tx = await DATABASE.transaction();
    try {
        await tx.from(TABLE_NAME_S_ADMIN).delete().where('id_user', userIdBin);
        await tx.from(TABLE_NAME_S_USER).delete().where('id_user', userIdBin);
        await tx.commit();
    } catch (e) {
        await tx.rollback();
        return Promise.reject(e);
    }
}