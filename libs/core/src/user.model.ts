import {z} from 'zod';

export type Language = 'en' | 'sw';
export type UserStatus = 'active' | 'inactive';

export type User = {
    readonly user_id?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
    kv: {
        first_name?: string;
        last_name?: string;
        status?: UserStatus;
        phone_number: string;
        date_of_birth?: string;
        pin?: string;
        password?: string;
        language: Language;
        email?: string;
        avg_cycle_length_days?: number;
        avg_period_length_days?: number;
        prev_cycle_start_date?: string;
        receive_period_alerts?: boolean;
        receive_fertile_alerts?: boolean;
        receive_medication_tips?: boolean;
        receive_insights_tips?: boolean;
        selected_symptoms?: string[];
        selected_moods?: string[];
        selected_medications?: string[];

      symptom_logs?: Array<{
        symptom: string;
        timestamp: string;
      }>;
      mood_logs?: Array<{
        mood: string;
        timestamp: string;
      }>;
      medication_logs?: Array<{
        medication: string;
        timestamp: string;
      }>;
    };
};

export type UpdateUser = Omit<User, 'kv'> & {
    kv?: Partial<User['kv']>;
};

export const USER_ZOD_SCHEMA = z.object({
    user_id: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
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
        prev_cycle_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Previous cycle start date must be in YYYY-MM-DD format'}).optional(),
        receive_period_alerts: z.boolean().optional(),
        receive_fertile_alerts: z.boolean().optional(),
        receive_medication_tips: z.boolean().optional(),
        receive_insights_tips: z.boolean().optional(),
        selected_symptoms: z.array(z.string()).optional(),
        selected_moods: z.array(z.string()).optional(),
        selected_medications: z.array(z.string()).optional(),

      symptom_logs: z.array(z.object({
        symptom: z.string(),
        timestamp: z.string(),
      })).optional(),
      mood_logs: z.array(z.object({
        mood: z.string(),
        timestamp: z.string(),
      })).optional(),
      medication_logs: z.array(z.object({
        medication: z.string(),
        timestamp: z.string(),
      })).optional(),
    }),
});