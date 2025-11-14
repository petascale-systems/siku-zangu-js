import { APIError, User, USER_ZOD_SCHEMA } from '@siku-zangu/core';
import { DATABASE } from '../create-database.function';
import { isTakenEmail } from './is-taken-email.function';
import { isTakenPhoneNumber } from './is-taken-phone-number.function';
import { TABLE_NAME_S_USER, TABLE_NAME_S_USER_KV } from '../table-names';
import { userToKv } from './user-to-kv.function';
import { randomUUID } from 'node:crypto';
import { Knex } from 'knex';

export const USER_TABLE_COLUMN_ALIASES = {
  user_id: DATABASE.raw('lower(hex(_u.id_user))'),
  created_at: DATABASE.raw('DATE_FORMAT(_u.created_at, "%Y-%m-%d %H:%i:%s")'),
  updated_at: DATABASE.raw('DATE_FORMAT(_u.updated_at, "%Y-%m-%d %H:%i:%s")'),
  first_name: '_first_name.v',
  last_name: '_last_name.v',
  status: DATABASE.raw('coalesce(_status.v,"active")'),
  phone_number: '_phone_number.v',
  date_of_birth: '_date_of_birth.v',
  language: DATABASE.raw('coalesce(_language.v,"sw")'),
  email: '_email.v',
  avg_cycle_length_days: DATABASE.raw('convert(_avg_cycle_length_days.v,unsigned)'),
  avg_period_length_days: DATABASE.raw('convert(_avg_period_length_days.v,unsigned)'),
  prev_cycle_start_date: '_prev_cycle_start_date.v',
  receive_period_alerts: '_receive_period_alerts.v',
  receive_fertile_alerts: '_receive_fertile_alerts.v',
  receive_medication_tips: '_receive_medication_tips.v',
  receive_insights_tips: '_receive_insights_tips.v',
  selected_symptoms: '_selected_symptoms.v',
  selected_moods: '_selected_moods.v',
  selected_medications: '_selected_medications.v',

  symptom_logs: '_symptom_logs.v',
  mood_logs: '_mood_logs.v',
  medication_logs: '_medication_logs.v',
};
export const USER_TABLE_COLUMN_ALIASES_WITH_PIN = {
  ...USER_TABLE_COLUMN_ALIASES,
  pin: '_pin.v',
};

export function buildUserTableJoins(db: Knex | Knex.Transaction) {
  return db
    .from('s_user as _u')
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
    .leftJoin('s_user_kv as _selected_symptoms', DATABASE.raw('_selected_symptoms.id_user=_u.id_user and _selected_symptoms.k="selected_symptoms"'))
    .leftJoin('s_user_kv as _selected_moods', DATABASE.raw('_selected_moods.id_user=_u.id_user and _selected_moods.k="selected_moods"'))
    .leftJoin('s_user_kv as _selected_medications', DATABASE.raw('_selected_medications.id_user=_u.id_user and _selected_medications.k="selected_medications"'))

    .leftJoin('s_user_kv as _symptom_logs', DATABASE.raw('_symptom_logs.id_user=_u.id_user and _symptom_logs.k="symptom_logs"'))
    .leftJoin('s_user_kv as _mood_logs', DATABASE.raw('_mood_logs.id_user=_u.id_user and _mood_logs.k="mood_logs"'))
    .leftJoin('s_user_kv as _medication_logs', DATABASE.raw('_medication_logs.id_user=_u.id_user and _medication_logs.k="medication_logs"'));
}
export function buildUserTableJoinsWithPin(db: Knex | Knex.Transaction) {
  return buildUserTableJoins(db)
    .leftJoin('s_user_kv as _pin', DATABASE.raw('_pin.id_user=_u.id_user and _pin.k="pin"'));
}
export function rowToUser(row: any) {
  return {
    user_id: row.user_id || undefined,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || undefined,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at || undefined,
    kv: {
      first_name: row.first_name ?? undefined,
      last_name: row.last_name ?? undefined,
      status: row.status ?? undefined,
      phone_number: row.phone_number || undefined,
      pin: row.pin || undefined,
      date_of_birth: row.date_of_birth ?? undefined,
      language: row.language || 'sw',
      email: row.email ?? undefined,
      avg_cycle_length_days: row.avg_cycle_length_days != null ? Number(row.avg_cycle_length_days) : undefined,
      avg_period_length_days: row.avg_period_length_days != null ? Number(row.avg_period_length_days) : undefined,
      prev_cycle_start_date: row.prev_cycle_start_date ?? undefined,
      receive_period_alerts: row.receive_period_alerts === 'true' ? true : row.receive_period_alerts === 'false' ? false : undefined,
      receive_fertile_alerts: row.receive_fertile_alerts === 'true' ? true : row.receive_fertile_alerts === 'false' ? false : undefined,
      receive_medication_tips: row.receive_medication_tips === 'true' ? true : row.receive_medication_tips === 'false' ? false : undefined,
      receive_insights_tips: row.receive_insights_tips === 'true' ? true : row.receive_insights_tips === 'false' ? false : undefined,
      selected_symptoms: row.selected_symptoms ? JSON.parse(row.selected_symptoms) : undefined,
      selected_moods: row.selected_moods ? JSON.parse(row.selected_moods) : undefined,
      selected_medications: row.selected_medications ? JSON.parse(row.selected_medications) : undefined,

      symptom_logs: row.symptom_logs ? JSON.parse(row.symptom_logs) : [],
      mood_logs: row.mood_logs ? JSON.parse(row.mood_logs) : [],
      medication_logs: row.medication_logs ? JSON.parse(row.medication_logs) : [],

    },
  } as User;
}


export async function insertOneUser(user: User) {
  const parsedUser = USER_ZOD_SCHEMA.safeParse(user);
  if (!parsedUser.success) {
    const issues = parsedUser.error.issues.map(i => ({
      path: i.path,
      error: i.message,
    }));
    console.error('insertOneUser: Validation failed:', issues);
    return Promise.reject({ status: 400, message: 'User validation failed', issues } as APIError);
  }

  const kvs = userToKv(parsedUser.data as User);
  if (kvs.length <= 0) {
    return Promise.reject({ status: 400, message: 'User validation failed', issues: [{ path: ['kv'], error: 'No valid key-value pairs' }] } as APIError);
  }

  if (parsedUser.data.kv.email) {
    if (await isTakenEmail(parsedUser.data.kv.email)) {
      return Promise.reject({
        status: 409,
        message: 'E-mail is taken',
        issues: [{ path: ['kv', 'email'], error: 'E-mail is taken' }],
      } as APIError);
    }
  }

  if (parsedUser.data.kv.phone_number) {
    const isTaken = await isTakenPhoneNumber(parsedUser.data.kv.phone_number);
    console.log('isTakenPhoneNumber:', isTaken);
    if (isTaken) {
      return Promise.reject({
        status: 409,
        message: 'Phone number is taken',
        issues: [{ path: ['kv', 'phone_number'], error: 'Phone number is taken' }],
      } as APIError);
    }
  }

  const userId = DATABASE.fn.uuidToBin(randomUUID());

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) return new Date().toISOString().replace('T', ' ').slice(0, 19);
    return date.replace('T', ' ').slice(0, 19);
  };
  const created_at = formatDateTime(parsedUser.data.created_at);
  const updated_at = formatDateTime(parsedUser.data.updated_at || parsedUser.data.created_at);

  const tx = await DATABASE.transaction();
  return tx
    .insert({ id_user: userId, created_at, updated_at })
    .into(TABLE_NAME_S_USER)
    .then(() => tx.insert(kvs.map(kv => ({ ...kv, id_user: userId }))).into(TABLE_NAME_S_USER_KV))
    .then(() => buildUserTableJoins(tx).where('_u.id_user', userId).first(USER_TABLE_COLUMN_ALIASES))
    .then(async row => {
      if (!row) {
        await tx.rollback();
        return Promise.reject({ status: 500, message: 'User INSERTed but SELECT returns zero records' } as APIError);
      }
      await tx.commit();
      const mappedUser = rowToUser(row);
      console.log('insertOneUser: Inserted user:', mappedUser);
      return mappedUser;
    })
    .catch(async e => {
      console.error('insertOneUser: Error:', e);
      await tx.rollback();
      return Promise.reject({ status: 500, message: 'User creation failed', details: e.message } as APIError);
    });
}