import {DATABASE, TABLE_NAME_S_USER} from "@siku-zangu/knex";

export async function deleteOneUserByUserId(userIdHex: string) {
    const userIdBin = Buffer.from(userIdHex.replace('-', ''), 'hex')
    await DATABASE.from(TABLE_NAME_S_USER).delete().where('id_user', userIdBin)
}