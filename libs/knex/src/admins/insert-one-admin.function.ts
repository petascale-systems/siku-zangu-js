import {Admin, ADMIN_ZOD_SCHEMA, APIError, zodErrorToApiError} from "@siku-zangu/core";
import {DATABASE} from "../create-database.function";
import {Knex} from "knex";
import {isTakenEmail, isTakenPhoneNumber, userToKv} from "../users";
import {randomUUID} from "node:crypto";
import {TABLE_NAME_S_ADMIN, TABLE_NAME_S_USER_KV} from "../table-names";

export const ADMIN_TABLE_COLUMN_ALIASES = {
    user_id: DATABASE.raw('lower(hex(_a.id_user))'),
    a_status: '_a.status',
    role: '_a.role',
    created_at: '_u.created_at',
    updated_at: '_u.updated_at',
    first_name: '_first_name.v',
    last_name: '_last_name.v',
    status: DATABASE.raw('coalesce(_status.v,"active")'),
    phone_number: '_phone_number.v',
    date_of_birth: '_date_of_birth.v',
    language: DATABASE.raw('coalesce(_language.v,"swa")'),
    email: '_email.v',
    avg_cycle_length_days: DATABASE.raw('convert(_avg_cycle_length_days.v,unsigned)'),
    avg_period_length_days: DATABASE.raw('convert(_avg_period_length_days.v,unsigned)'),
    prev_cycle_start_date: '_prev_cycle_start_date.v',
    receive_period_alerts: '_receive_period_alerts.v',
    receive_fertile_alerts: '_receive_fertile_alerts.v',
    receive_medication_tips: '_receive_medication_tips.v',
    receive_insights_tips: '_receive_insights_tips.v',
}

export function rowToAdmin(row: any) {
    return {
        user_id: row.user_id,
        status: row.a_status,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at,
        kv: {
            first_name: row.first_name,
            last_name: row.last_name,
            status: row.status,
            phone_number: row.phone_number,
            date_of_birth: row.date_of_birth,
            language: row.language,
            email: row.email,
            avg_cycle_length_days: row.avg_cycle_length_days,
            avg_period_length_days: row.avg_period_length_days,
            prev_cycle_start_date: row.prev_cycle_start_date,
            receive_period_alerts: row.receive_period_alerts == 'true',
            receive_fertile_alerts: row.receive_fertile_alerts == 'true',
            receive_medication_tips: row.receive_medication_tips == 'true',
            receive_insights_tips: row.receive_insights_tips == 'true'
        }
    } as Admin
}

export function buildAdminTableJoins(db: Knex | Knex.Transaction) {
    return db.from('s_admin as _a')
        .innerJoin('s_user as _u', DATABASE.raw('_u.id_user=_a.id_user'))
        .leftJoin('s_user_kv as _first_name', DATABASE.raw('_first_name.id_user=_u.id_user and _first_name.k="first_name"'))
        .leftJoin('s_user_kv as _last_name', DATABASE.raw('_last_name.id_user=_u.id_user and _last_name.k="last_name"'))
        .leftJoin('s_user_kv as _status', DATABASE.raw('_status.id_user=_u.id_user and _status.k="status"'))
        .leftJoin('s_user_kv as _phone_number', DATABASE.raw('_phone_number.id_user=_u.id_user and _phone_number.k="phone_number"'))
        .leftJoin('s_user_kv as _date_of_birth', DATABASE.raw('_date_of_birth.id_user=_u.id_user and _date_of_birth.k="date_of_birth"'))
        .leftJoin('s_user_kv as _language', DATABASE.raw('_language.id_user=_u.id_user and _language.k="language"'))
        .leftJoin('s_user_kv as _email', DATABASE.raw('_email.id_user=_u.id_user and _email.k="email"'))
        .leftJoin('s_user_kv as _avg_cycle_length_days', DATABASE.raw('_avg_cycle_length_days.id_user=_u.id_user and _avg_cycle_length_days.k="avg_cycle_length_days"'))
        .leftJoin('s_user_kv as _avg_period_length_days', DATABASE.raw('_avg_period_length_days.id_user=_u.id_user and _avg_period_length_days.k="avg_period_length_days"'))
        .leftJoin('s_user_kv as _prev_cycle_start_date', DATABASE.raw('_prev_cycle_start_date.id_user=_u.id_user and _prev_cycle_start_date.k="prev_cycle_start_date"'))
        .leftJoin('s_user_kv as _receive_period_alerts', DATABASE.raw('_receive_period_alerts.id_user=_u.id_user and _receive_period_alerts.k="receive_period_alerts"'))
        .leftJoin('s_user_kv as _receive_fertile_alerts', DATABASE.raw('_receive_fertile_alerts.id_user=_u.id_user and _receive_fertile_alerts.k="receive_fertile_alerts"'))
        .leftJoin('s_user_kv as _receive_medication_tips', DATABASE.raw('_receive_medication_tips.id_user=_u.id_user and _receive_medication_tips.k="receive_medication_tips"'))
        .leftJoin('s_user_kv as _receive_insights_tips', DATABASE.raw('_receive_insights_tips.id_user=_u.id_user and _receive_insights_tips.k="receive_insights_tips"'))
}

export async function insertOneAdmin(admin: Admin) {
    const parsedAdmin = ADMIN_ZOD_SCHEMA.safeParse(admin);
    if (!parsedAdmin.success) {
        return Promise.reject(zodErrorToApiError(parsedAdmin.error));
    }

    const adminKv = parsedAdmin.data.kv;
    const kvArray = userToKv(parsedAdmin.data);
    if (!adminKv?.email) {
        return Promise.reject({
            status: 400,
            message: 'Bad request',
            issues: [{path: ['kv', 'email'], error: 'E-mail is required'}]
        });
    }

    if (!adminKv?.first_name) {
        return Promise.reject({
            status: 400,
            message: 'Bad request',
            issues: [{path: ['kv', 'first_name'], error: 'First name is required'}]
        });
    }

    if (!adminKv?.last_name) {
        return Promise.reject({
            status: 400,
            message: 'Bad request',
            issues: [{path: ['kv', 'last_name'], error: 'Last name is required'}]
        });
    }

    if (await isTakenEmail(adminKv.email)) {
        return Promise.reject({
            status: 409,
            message: 'E-mail is taken',
            issues: [{path: ['kv', 'email'], error: 'E-mail is taken'}],
        });
    }

    if (adminKv?.phone_number && await isTakenPhoneNumber(adminKv.phone_number)) {
        return Promise.reject({
            status: 409,
            message: 'Phone number is taken',
            issues: [{path: ['kv', 'phone_number'], error: 'Phone number is taken'}],
        })
    }

    const tx = await DATABASE.transaction();
    const userId = DATABASE.fn.uuidToBin(randomUUID());

    try {
        await tx.insert({id_user: userId}).into('s_user');
        await tx.insert(kvArray.map(kv => ({...kv, id_user: userId}))).into(TABLE_NAME_S_USER_KV);
        await tx.insert({
            id_user: userId,
            status: parsedAdmin.data.status ?? 'active',
            role: parsedAdmin.data.role ?? 'member'
        }).into(TABLE_NAME_S_ADMIN);

        const row = await buildAdminTableJoins(tx).where('_a.id_user', userId).first(ADMIN_TABLE_COLUMN_ALIASES);
        await tx.commit();
        return rowToAdmin(row);
    } catch (e: any) {
        console.error('insertOneAdmin: Error:', e);
        await tx.rollback();
        return Promise.reject({status: 500, message: 'Admin creation failed', details: e.message} as APIError);
    }
}