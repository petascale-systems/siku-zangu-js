import {APIError, User, USER_ZOD_SCHEMA, zodErrorToApiError} from "@siku-zangu/core";
import {userToKv} from "./user-to-kv.function";
import {userExistsByUserId} from "./user-exists-by-user-id.function";
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {isTakenEmail} from "./is-taken-email.function";
import {isTakenPhoneNumber} from "./is-taken-phone-number.function";
import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_USER, TABLE_NAME_S_USER_KV} from "../table-names";
import {insertUserLogs} from "./insert-user-logs.function";
import {selectedFromLogs, userLogsToRows} from "./user-log.function";
import {Knex} from 'knex';


export async function updateOneUser(userIdHex: string, user: User): Promise<User> {
    const parsedUser = USER_ZOD_SCHEMA.safeParse(user);
    if (!parsedUser.success) {
        return Promise.reject(zodErrorToApiError(parsedUser.error))
    }

    if (!await userExistsByUserId(userIdHex)) {
        return Promise.reject({status: 404, message: 'User not found'} as APIError);
    }

    const data = parsedUser.data;
    const kvs = userToKv(data as User);
    const userIdBin = Buffer.from(userIdHex.replace(/-/g, '').toLowerCase(), 'hex');

    const currentRow = await buildUserTableJoins(DATABASE).where('_u.id_user', userIdBin).first(USER_TABLE_COLUMN_ALIASES);
    if (!currentRow) {
        return Promise.reject({status: 500, message: 'User exists but SELECT failed'} as APIError);
    }
    const currentUser = rowToUser(currentRow);

    if (data?.kv?.email && data?.kv?.email.toLowerCase() !== (currentUser?.kv?.email?.toLowerCase() || null)) {
        if (await isTakenEmail(data?.kv.email)) {
            return Promise.reject({
                status: 409,
                message: 'E-mail is taken',
                issues: [{path: ['kv', 'email'], error: 'E-mail is taken'}],
            } as APIError);
        }
    }
    if (data?.kv?.phone_number && data?.kv?.phone_number !== currentUser?.kv?.phone_number) {
        if (await isTakenPhoneNumber(data.kv.phone_number)) {
            return Promise.reject({
                status: 409,
                message: 'Phone number is taken',
                issues: [{path: ['kv', 'phone_number'], error: 'Phone number is taken'}],
            } as APIError);
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

        // `*_logs` in the body are entries to APPEND, not an array that
        // replaces what is stored. The request and response shapes are
        // unchanged; only the meaning is. This is what makes a shipped v1.1.0
        // client — which still sends its whole history every save — unable to
        // clobber anything: the unique index ignores what is already there.
        await insertUserLogs(tx, userIdBin, userLogsToRows(data.kv));

        // "Current is updated": the set just submitted becomes the current
        // selection, so unticking an item is how you drop it. Only kinds
        // present in the body are touched, and an empty array never clears —
        // see selectedFromLogs.
        const selected = userToKv({ kv: selectedFromLogs(data.kv) } as User);
        if (selected.length > 0) {
            await tx
                .insert(selected.map(kv => ({...kv, id_user: userIdBin})))
                .into(TABLE_NAME_S_USER_KV)
                .onConflict(['id_user', 'k'])
                .merge(['v']);
        }

        const updatedRow = await buildUserTableJoins(tx).where('_u.id_user', userIdBin).first(USER_TABLE_COLUMN_ALIASES);
        if (!updatedRow) {
            return Promise.reject({status: 500, message: 'User updated but SELECT returns zero records'} as APIError);
        }

        await tx.commit();
        // kv already holds what was just submitted, so the response carries it
        // without a second read.
        return rowToUser(updatedRow);
    } catch (e: any) {
        await tx.rollback();
        return Promise.reject({status: 500, message: 'User update failed', details: e.message} as APIError);
    }
}