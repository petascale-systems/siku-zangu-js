import {APIError, User, USER_ZOD_SCHEMA, zodErrorToApiError} from "@siku-zangu/core";
import {userToKv} from "./user-to-kv.function";
import {userExistsByUserId} from "./user-exists-by-user-id.function";
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {isTakenEmail} from "./is-taken-email.function";
import {isTakenPhoneNumber} from "./is-taken-phone-number.function";
import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_USER, TABLE_NAME_S_USER_KV} from "../table-names";
import {Knex} from 'knex';


export async function updateOneUser(userIdHex: string, partialUser: Partial<User>): Promise<User> {
    const parsedUser = USER_ZOD_SCHEMA.safeParse(partialUser);
    if (!parsedUser.success) {
        return Promise.reject(zodErrorToApiError(parsedUser.error))
    }

    if (!await userExistsByUserId(userIdHex)) {
        throw {status: 404, message: 'User not found'} as APIError;
    }

    const data = parsedUser.data;
    const kvs = userToKv(data as User);
    const userIdBin = Buffer.from(userIdHex.replace(/-/g, '').toLowerCase(), 'hex');

    const currentRow = await buildUserTableJoins(DATABASE).where('_u.id_user', userIdBin).first(USER_TABLE_COLUMN_ALIASES);
    if (!currentRow) {
        throw {status: 500, message: 'User exists but SELECT failed'} as APIError;
    }
    const currentUser = rowToUser(currentRow);

    if (data?.kv?.email && data?.kv?.email.toLowerCase() !== (currentUser?.kv?.email?.toLowerCase() || null)) {
        if (await isTakenEmail(data?.kv.email)) {
            throw {
                status: 409,
                message: 'E-mail is taken',
                issues: [{path: ['kv', 'email'], error: 'E-mail is taken'}],
            } as APIError;
        }
    }
    if (data?.kv?.phone_number && data?.kv?.phone_number !== currentUser?.kv?.phone_number) {
        if (await isTakenPhoneNumber(data.kv.phone_number)) {
            throw {
                status: 409,
                message: 'Phone number is taken',
                issues: [{path: ['kv', 'phone_number'], error: 'Phone number is taken'}],
            } as APIError;
        }
    }

    const tx: Knex.Transaction = await DATABASE.transaction();
    try {
        await tx(TABLE_NAME_S_USER)
            .where('id_user', userIdBin)
            .update({updated_at: DATABASE.fn.now()});

        if (kvs.length > 0) {
            await tx
                .insert(kvs.map(kv => ({...kv, id_user: userIdBin})))
                .into(TABLE_NAME_S_USER_KV)
                .onConflict(['id_user', 'k'])
                .merge(['v']);
        }
        const updatedRow = await buildUserTableJoins(tx).where('_u.id_user', userIdBin).first(USER_TABLE_COLUMN_ALIASES);
        if (!updatedRow) {
            throw new Error('User updated but SELECT returns zero records');
        }

        await tx.commit();
        const mappedUser = rowToUser(updatedRow);
        return mappedUser;
    } catch (e: any) {
        await tx.rollback();
        throw {status: 500, message: 'User update failed', details: e.message} as APIError;
    }
}