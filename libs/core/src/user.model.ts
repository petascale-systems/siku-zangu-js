import { z } from 'zod';

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
  };
};

export const USER_ZOD_SCHEMA = z.object({
  user_id: z.string().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  kv: z.object({
    first_name: z
      .string()
      .max(64, { message: 'First name is too long' })
      .nullable()
      .optional(),
    last_name: z
      .string()
      .max(64, { message: 'Last name is too long' })
      .nullable()
      .optional(),
    status: z.enum(['active', 'inactive']).nullable().optional(),
    phone_number: z.string().regex(/^[A-Z]{2}\s\d{6,12}$/, {
      message:
        'Phone number must be 2 uppercase letters, a space, and 6-12 digits',
    }),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Date of birth must be in YYYY-MM-DD format',
      })
      .nullable()
      .optional(),
    pin: z
      .string()
      .regex(/^\$2b\$10\$.{53}$/, {
        message: 'PIN must be a valid bcrypt hash',
      })
      .nullable()
      .optional(),
    password: z
      .string()
      .regex(/^\d{4}$/, { message: 'Password must be exactly 4 digits' })
      .nullable()
      .optional(),
    language: z.enum(['en', 'sw'], {
      message: 'Language must be "en" or "sw"',
    }),
    email: z
      .string()
      .email({ message: 'E-mail address is invalid' })
      .nullable()
      .optional(),
    avg_cycle_length_days: z
      .number()
      .min(0, { message: 'Average cycle length is invalid' })
      .max(365, { message: 'Average cycle length is invalid' })
      .nullable()
      .optional(),
    avg_period_length_days: z
      .number()
      .min(0, { message: 'Average period length is invalid' })
      .max(365, { message: 'Average period length is invalid' })
      .nullable()
      .optional(),
    prev_cycle_start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Previous cycle start date must be in YYYY-MM-DD format',
      })
      .nullable()
      .optional(),
    receive_period_alerts: z.boolean().nullable().optional(),
    receive_fertile_alerts: z.boolean().nullable().optional(),
    receive_medication_tips: z.boolean().nullable().optional(),
    receive_insights_tips: z.boolean().nullable().optional(),
  }),
});

export const REGISTER_USER_ZOD_SCHEMA = USER_ZOD_SCHEMA.extend({
  kv: USER_ZOD_SCHEMA.shape.kv.extend({
    pin: z
      .string()
      .regex(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
      .nullable()
      .optional(),
  }),
});
