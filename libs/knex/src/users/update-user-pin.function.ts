import {DATABASE} from '../create-database.function';
import {APIError} from '@siku-zangu/core';

export async function updateUserPin(userIdHex: string, hashedPin: string): Promise<void> {
    try {
        const userIdBin = Buffer.from(userIdHex.replace(/-/g, ''), 'hex');
        await DATABASE('s_user_kv')
            .where('id_user', userIdBin)
            .where('k', 'pin')
            .update({v: hashedPin});

    } catch (e: any) {
        return Promise.reject({status: 500, message: 'Failed to update PIN',} as APIError);
    }
}