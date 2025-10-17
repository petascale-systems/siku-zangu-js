import {DATABASE} from "@siku-zangu/knex";
import {APIError, UserIdAndPassword} from "@siku-zangu/core";

export async function selectUserIdAndPasswordByEmail(email: string) {
    const user = await DATABASE
        .from('s_user_kv as _email')
        .innerJoin('s_user_kv as _password', DATABASE.raw('_password.id_user=_email.id_user and _password.k="password"'))
        .where('_email.k', '=', 'email')
        .andWhere('_email.v', '=', email)
        .first({user_id: DATABASE.raw('lower(hex(_password.id_user))'), password: '_password.v'});
    if (!user) return Promise.reject({
        status: 400,
        message: 'Invalid email or password',
        issues: [{path: ['email'], error: 'Invalid email or password'}]
    } as APIError);
    return {user_id: user.user_id, password: user.password} as UserIdAndPassword;
}