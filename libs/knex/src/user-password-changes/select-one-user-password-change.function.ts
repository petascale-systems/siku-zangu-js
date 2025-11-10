import {DATABASE} from "@siku-zangu/knex";
import {UserPasswordChange} from "@siku-zangu/core";

export async function selectOneUserPasswordChange(changeIdHex: string) {
    return DATABASE.from('s_user_password_change')
        .where('id_password_change', Buffer.from(changeIdHex, 'hex'))
        .first({
            user_id: DATABASE.raw('lower(hex(id_user))'),
            password_change_id: DATABASE.raw('lower(hex(id_password_change))'),
        })
        .then(row => {
            if (!row) return Promise.reject({status: 404, message: 'Link not found'});
            return row as UserPasswordChange;
        })
}