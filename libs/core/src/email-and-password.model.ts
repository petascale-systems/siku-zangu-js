import {z} from 'zod';

export type EmailAndPassword = {
    email: string;
    password: string;
}

export const EMAIL_AND_PASSWORD_SCHEMA = z.object({
    email: z.email('E-mail is not valid').min(1, 'E-mail is required').trim(),
    password: z.string().min(1, 'Password is required').trim(),
})