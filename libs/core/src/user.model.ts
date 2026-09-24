import {z} from 'zod';

export type Language = 'en' | 'sw';
export type UserStatus = 'active' | 'inactive';

export type UserKv = {
    first_name?: string;
    last_name?: string;
    status?: UserStatus;
    phone_number?: string;
    date_of_birth?: string;
    pin?: string;
    password?: string;
    language?: Language;
    email?: string;
    avg_cycle_length_days?: number;
    avg_period_length_days?: number;
    prev_cycle_start_date?: string;
    /** Last day of the period that began on `prev_cycle_start_date`. An empty string clears it. */
    prev_period_end_date?: string;
    receive_period_alerts?: boolean;
    receive_fertile_alerts?: boolean;
    receive_medication_tips?: boolean;
    receive_insights_tips?: boolean;
    receive_new_articles?: boolean;
    selected_symptoms?: string[];
    selected_moods?: string[];
    selected_medications?: string[];
    symptom_logs?: Array<{ symptom: string; timestamp: string; }>;
    mood_logs?: Array<{ mood: string; timestamp: string; }>;
    medication_logs?: Array<{ medication: string; timestamp: string; }>;
    /** Entries to append to the history: `date` is the day marked, `timestamp` when it was marked. */
    period_start_logs?: Array<{ date: string; timestamp: string; }>;
    period_end_logs?: Array<{ date: string; timestamp: string; }>;
    fcm_token?: string;
    onboarding_complete?: boolean;
};

export type User = {
    readonly user_id?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
    kv: UserKv;
};

/**
 * Upper bound on entries in one save.
 *
 * Deliberately generous rather than tight: a shipped v1.1.0 client still sends
 * its *entire* history on every save, and the old varchar(4096) cell held about
 * 70 entries. A limit near what a person ticks in a day would reject those
 * requests outright and break logging for anyone who has not updated. This
 * bounds abuse while leaving every real payload room.
 */
const MAX_LOGS_PER_SAVE = 200;

/** Matches the `value` column width in `s_user_log`. */
const LOG_VALUE = z.string().min(1, {message: 'Log value is required'}).max(64, {message: 'Log value is too long'});

const LOG_TIMESTAMP = z.string().datetime({message: 'Log timestamp must be an ISO datetime'});

/**
 * A period date is a calendar day on the user's device, not an instant, so the
 * server cannot know which day it is for them. Allow up to UTC+14 — the
 * furthest-ahead timezone — so a user whose "today" is already tomorrow in UTC
 * is not rejected, while anything genuinely in the future still is.
 */
const MAX_TZ_AHEAD_MS = 14 * 60 * 60 * 1000;
const isNotFutureDay = (iso: string): boolean =>
    iso === '' || iso <= new Date(Date.now() + MAX_TZ_AHEAD_MS).toISOString().slice(0, 10);
const NOT_FUTURE = {message: 'Period dates cannot be in the future'};

const LOG_DATE = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Log date must be in YYYY-MM-DD format'})
    .refine(isNotFutureDay, NOT_FUTURE);

export const USER_ZOD_SCHEMA = z.object({
    kv: z.object({
        first_name: z.string().max(64, {message: 'First name is too long'}).optional(),
        last_name: z.string().max(64, {message: 'Last name is too long'}).optional(),
        status: z.enum(['active', 'inactive']).optional(),
        phone_number: z.string().regex(/^[A-Z]{2}\s?\d{6,12}$/, {message: 'Phone number must be a country ISO code followed by the NSN'}).optional(),
        date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Date of birth must be in YYYY-MM-DD format'}).optional(),
        pin: z.string().regex(/^\d{4}$/, {message: 'PIN must be exactly 4 digits'}).optional(),
        password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {message: 'Password is weak'}).optional(),
        language: z.enum(['en', 'sw'], {message: 'Language must be either "en" or "sw"'}).optional(),
        email: z.email({message: 'E-mail address is invalid'}).optional(),
        avg_cycle_length_days: z.number().min(0, {message: 'Average cycle length is invalid'}).max(365, {message: 'Average cycle length is invalid'}).optional(),
        avg_period_length_days: z.number().min(0, {message: 'Average period length is invalid'}).max(365, {message: 'Average period length is invalid'}).optional(),
        prev_cycle_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Previous cycle start date must be in YYYY-MM-DD format'}).refine(isNotFutureDay, NOT_FUTURE).optional(),
        // Empty is allowed: it is how a new start date that falls on or after the
        // stored end clears that end.
        prev_period_end_date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, {message: 'Previous period end date must be in YYYY-MM-DD format'}).refine(isNotFutureDay, NOT_FUTURE).optional(),
        receive_period_alerts: z.boolean().optional(),
        receive_fertile_alerts: z.boolean().optional(),
        receive_medication_tips: z.boolean().optional(),
        receive_insights_tips: z.boolean().optional(),
        receive_new_articles: z.boolean().optional(),
        selected_symptoms: z.array(z.string()).optional(),
        selected_moods: z.array(z.string()).optional(),
        selected_medications: z.array(z.string()).optional(),
        // Bounded, and the timestamp is a real datetime.
        //
        // These arrays used to be unbounded with a bare `z.string()` timestamp;
        // the only thing limiting them was the varchar(4096) cell they were
        // serialised into. They now append to a table with no such ceiling, and
        // `REQUIRE_USER_AUTH` still defaults to false, so the bound has to be
        // stated here instead.
        symptom_logs: z.array(z.object({symptom: LOG_VALUE, timestamp: LOG_TIMESTAMP,})).max(MAX_LOGS_PER_SAVE).optional(),
        mood_logs: z.array(z.object({mood: LOG_VALUE, timestamp: LOG_TIMESTAMP,})).max(MAX_LOGS_PER_SAVE).optional(),
        medication_logs: z.array(z.object({medication: LOG_VALUE, timestamp: LOG_TIMESTAMP,})).max(MAX_LOGS_PER_SAVE).optional(),
        period_start_logs: z.array(z.object({date: LOG_DATE, timestamp: LOG_TIMESTAMP,})).max(MAX_LOGS_PER_SAVE).optional(),
        period_end_logs: z.array(z.object({date: LOG_DATE, timestamp: LOG_TIMESTAMP,})).max(MAX_LOGS_PER_SAVE).optional(),
        fcm_token: z.string().optional(),
        onboarding_complete: z.boolean().optional(),
    }),
});