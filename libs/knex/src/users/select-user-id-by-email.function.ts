import {DATABASE} from "@siku-zangu/knex";
import {APIError} from "@siku-zangu/core";

export async function selectUserIdByEmail(email: string) {
    const user = await DATABASE
        .from('s_user_kv as _email')
        .where('_email.k', '=', 'email')
        .andWhere('_email.v', '=', email)
        .first({user_id: DATABASE.raw('lower(hex(_email.id_user))')});
    if (!user) return Promise.reject({
        status: 404,
        message: 'Invalid email',
        issues: [{path: ['email'], error: 'Invalid email'}]
    } as APIError);

    return user.user_id as string;
}