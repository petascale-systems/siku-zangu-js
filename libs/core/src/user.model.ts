import {z} from 'zod'

export type Language = 'en' | 'swa'
export type UserStatus = 'active' | 'inactive'

export type User = {
    readonly user_id?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
    kv?: {
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
        receive_period_alerts?: boolean;
        receive_fertile_alerts?: boolean;
        receive_medication_tips?: boolean;
        receive_insights_tips?: boolean;
    }
}

export const USER_ZOD_SCHEMA = z.object({
    kv: z.object({
        first_name: z.string().max(64, {message: 'First name is too long'}).optional(),
        last_name: z.string().max(64, {message: 'Last name is too long'}).optional(),
        status: z.enum(['active', 'inactive']).optional(),
        phone_number: z.string().regex(new RegExp('[A-Z]{2} d{6,12}'), {message: 'Phone number is invalid'}).optional(),
        date_of_birth: z.string().regex(/\d{4}-\d{2}-\d{2}/g, {message: 'Date of birth is invalid'}).optional(),
        pin: z.string().regex(/d{4}/g, {message: 'PIN is invalid'}).optional(),
        password: z.string().regex(new RegExp('d{4}')).optional(),
        language: z.enum(['en', 'swa'], {message: 'Language is invalid'}).optional(),
        email: z.email({message: 'E-mail address is invalid'}).optional(),
        avg_cycle_length_days: z.number()
            .min(0, {message: 'Average cycle length is invalid'})
            .max(365, {message: 'Average cycle length is invalid'}).optional(),
        avg_period_length_days: z.number()
            .min(0, {message: 'Average period length is invalid'})
            .max(365, {message: 'Average period length is invalid'}).optional(),
        prev_cycle_start_date: z.string().regex(/\d{4}-\d{2}-\d{2}/g, {message: 'Previous cycle start date is invalid'}).optional(),
        receive_period_alerts: z.boolean().optional(),
        receive_fertile_alerts: z.boolean().optional(),
        receive_medication_tips: z.boolean().optional(),
        receive_insights_tips: z.boolean().optional(),
    }).optional()
})