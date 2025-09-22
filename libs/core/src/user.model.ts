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