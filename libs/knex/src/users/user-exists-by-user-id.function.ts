import {DATABASE, TABLE_NAME_S_USER} from "@siku-zangu/knex";

export async function userExistsByUserId(userIdHex: string) {
    return DATABASE
        .from(TABLE_NAME_S_USER)
        .where('id_user', Buffer.from(userIdHex.replace('-', ''), 'hex'))
        .count<{ count: number }>({count: '*'})
        .then((count) => count.count > 0)
}