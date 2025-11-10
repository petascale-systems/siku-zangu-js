import {DATABASE} from "@siku-zangu/knex";

export async function deleteOneUserPasswordChange(changeIdHex: string) {
    await DATABASE
        .from('s_user_password_change')
        .where({id_password_change: Buffer.from(changeIdHex, 'hex')})
        .delete()
}