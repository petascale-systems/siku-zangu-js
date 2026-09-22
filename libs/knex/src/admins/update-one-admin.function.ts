import {Admin, ADMIN_ZOD_SCHEMA, APIError, zodErrorToApiError} from "@siku-zangu/core";
import {selectOneAdminByUserId} from "./select-one-admin-by-user-id.function";
import {isTakenEmail, isTakenPhoneNumber, userToKv} from "../users";
import {DATABASE} from "../create-database.function";
import {TABLE_NAME_S_ADMIN, TABLE_NAME_S_USER_KV} from "../table-names";
import {ADMIN_TABLE_COLUMN_ALIASES, buildAdminTableJoins, rowToAdmin} from "./insert-one-admin.function";

export async function updateOneAdmin(hexUserId: string, admin: Admin) {
    const parsedAdmin = ADMIN_ZOD_SCHEMA.safeParse(admin);
    if (!parsedAdmin.success) {
        return Promise.reject(zodErrorToApiError(parsedAdmin.error));
    }

    const oldAdmin = await selectOneAdminByUserId(hexUserId);
    const kvArray = userToKv(parsedAdmin.data);
    if (kvArray.length === 0 && !parsedAdmin.data.status && !parsedAdmin.data.role) {
        return oldAdmin;
    }

    const newAdminKv = parsedAdmin.data?.kv;
    if (newAdminKv?.email && newAdminKv?.email !== oldAdmin?.kv?.email && await isTakenEmail(newAdminKv?.email)) {
        return Promise.reject({
            status: 409,
            message: 'E-mail is taken',
            issues: [{path: ['kv', 'email'], error: 'E-mail is taken'}],
        });
    }

    if (newAdminKv?.phone_number
        && newAdminKv?.phone_number !== oldAdmin?.kv?.phone_number
        && await isTakenPhoneNumber(newAdminKv?.phone_number)) {
        return Promise.reject({
            status: 409,
            message: 'Phone number is taken',
            issues: [{path: ['kv', 'phone_number'], error: 'Phone number is taken'}],
        })
    }

    const tx = await DATABASE.transaction();
    const binUserId = Buffer.from(hexUserId.replace(/-/g, ''), 'hex');

    try {
        const insertAdmin = {} as Admin;
        if (parsedAdmin.data.role) insertAdmin.role = parsedAdmin.data.role;
        if (parsedAdmin.data.status) insertAdmin.status = parsedAdmin.data.status;
        if (Object.keys(insertAdmin).length > 0) {
            await tx.table(TABLE_NAME_S_ADMIN).update(insertAdmin).where({id_user: binUserId});
        }

        if (kvArray.length > 0) {
            await tx.insert(kvArray.map(kv => ({...kv, id_user: binUserId})))
                .into(TABLE_NAME_S_USER_KV)
                .onConflict()
                .merge(['v']);
        }

        const row = await buildAdminTableJoins(tx).where('_a.id_user', binUserId).first(ADMIN_TABLE_COLUMN_ALIASES);
        await tx.commit();
        return rowToAdmin(row);
    } catch (e: any) {
        console.error('updateOneAdmin: Error:', e);
        await tx.rollback();
        return Promise.reject({status: 500, message: 'Admin update failed', details: e.message} as APIError);
    }
}