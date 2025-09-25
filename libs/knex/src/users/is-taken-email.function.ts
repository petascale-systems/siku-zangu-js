import {DATABASE, TABLE_NAME_S_USER_KV} from "@siku-zangu/knex";

export async function isTakenEmail(email: string, userId?: Buffer) {
    let query = DATABASE.from(TABLE_NAME_S_USER_KV).where({k: 'email', v: email});
    if (userId) query = query.andWhereNot('id_user', userId);
    return query
        .count<{ count: number }>({count: '*'})
        .then((count) => count.count > 0)
}