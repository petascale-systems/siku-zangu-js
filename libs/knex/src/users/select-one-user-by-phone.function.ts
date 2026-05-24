import {APIError} from '@siku-zangu/core';
import {DATABASE} from '../create-database.function';
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES,} from './insert-one-user.function';

export async function selectOneUserByPhone(phone: string) {
    try {
        const user = await buildUserTableJoins(DATABASE)
            .where('_phone_number.v', phone)
            .first(USER_TABLE_COLUMN_ALIASES);

        if (!user) {
            return Promise.reject({status: 404, message: 'User not found'} as APIError);
        }

        return rowToUser(user);
    } catch (e: any) {
        throw {status: e.status || 500,
            message: e.message || 'Database error',
        } as APIError;
    }
}
