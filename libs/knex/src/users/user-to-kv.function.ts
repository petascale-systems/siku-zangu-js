import { User, Kv } from '@siku-zangu/core';
import { createBcryptHash } from '../create-bcrypt-hash.function';

export function userToKv(user: User) {
  const userKv = user?.kv;
  const kvs: Kv[] = [];
  if (userKv?.first_name) kvs.push({ k: 'first_name', v: userKv?.first_name });
  if (userKv?.last_name) kvs.push({ k: 'last_name', v: userKv?.last_name });
  if (userKv?.status) kvs.push({ k: 'status', v: userKv?.status });
  if (userKv?.phone_number)
    kvs.push({ k: 'phone_number', v: userKv?.phone_number });
  if (userKv?.date_of_birth)
    kvs.push({ k: 'date_of_birth', v: userKv?.date_of_birth });
  if (userKv?.pin) kvs.push({ k: 'pin', v: createBcryptHash(userKv?.pin) });
  if (userKv?.password)
    kvs.push({ k: 'password', v: createBcryptHash(userKv?.password) });
  if (userKv?.language)
    kvs.push({ k: 'language', v: userKv?.language.toLowerCase() });
  if (userKv?.email) kvs.push({ k: 'email', v: userKv?.email.toLowerCase() });
  if (userKv?.prev_cycle_start_date)
    kvs.push({ k: 'prev_cycle_start_date', v: userKv?.prev_cycle_start_date });
  if (userKv?.avg_cycle_length_days)
    kvs.push({
      k: 'avg_cycle_length_days',
      v: userKv?.avg_cycle_length_days.toString(),
    });
  if (userKv?.avg_period_length_days)
    kvs.push({
      k: 'avg_period_length_days',
      v: userKv?.avg_period_length_days.toString(),
    });
  if (
    userKv?.receive_period_alerts == true ||
    userKv?.receive_period_alerts == false
  )
    kvs.push({
      k: 'receive_period_alerts',
      v: userKv?.receive_period_alerts.toString(),
    });
  if (
    userKv?.receive_fertile_alerts == true ||
    userKv?.receive_fertile_alerts == false
  )
    kvs.push({
      k: 'receive_fertile_alerts',
      v: userKv?.receive_fertile_alerts.toString(),
    });
  if (
    userKv?.receive_medication_tips == true ||
    userKv?.receive_medication_tips == false
  )
    kvs.push({
      k: 'receive_medication_tips',
      v: userKv?.receive_medication_tips.toString(),
    });
  if (
    userKv?.receive_insights_tips == true ||
    userKv?.receive_insights_tips == false
  )
    kvs.push({
      k: 'receive_insights_tips',
      v: userKv?.receive_insights_tips.toString(),
    });
  if (user.kv.selected_symptoms !== undefined) {
    kvs.push({
      k: 'selected_symptoms',
      v: JSON.stringify(user.kv.selected_symptoms),
    });
  }

  if (user.kv.selected_moods !== undefined) {
    kvs.push({
      k: 'selected_moods',
      v: JSON.stringify(user.kv.selected_moods),
    });
  }

  if (user.kv.selected_medications !== undefined) {
    kvs.push({
      k: 'selected_medications',
      v: JSON.stringify(user.kv.selected_medications),
    });
  }

  if (user.kv.symptom_logs !== undefined) {
    kvs.push({
      k: 'symptom_logs',
      v: JSON.stringify(user.kv.symptom_logs),
    });
  }

  if (user.kv.mood_logs !== undefined) {
    kvs.push({
      k: 'mood_logs',
      v: JSON.stringify(user.kv.mood_logs),
    });
  }

  if (user.kv.medication_logs !== undefined) {
    kvs.push({
      k: 'medication_logs',
      v: JSON.stringify(user.kv.medication_logs),
    });
  }

  return kvs;
}
