import {randomUUID} from "node:crypto";
import {DATABASE} from "@siku-zangu/knex";
import {UserPasswordChange} from "@siku-zangu/core";

export async function insertOneUserPasswordChange(userId: string) {
    const changeIdHex = randomUUID().replace(/-/g, '');
    await DATABASE
        .insert({
            id_user: Buffer.from(userId.replace(/-/g, ''), 'hex'),
            id_password_change: Buffer.from(changeIdHex, 'hex'),
        })
        .into('s_user_password_change')

    return {user_id: userId, password_change_id: changeIdHex} as UserPasswordChange;
}