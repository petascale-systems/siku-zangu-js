import {z} from 'zod';

export type Password = {
    password: string;
    confirm_password: string;
}

export const PASSWORD_ZOD_SCHEMA = z
    .object({
        password: z.string({message: 'Password is required'})
            .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {message: 'Password is weak'}),
        confirm_password: z.string({message: 'Password is required'}),
    })
    .refine((form) => form.password === form.confirm_password, {
        path: ['confirm_password'],
        message: 'Passwords must match'
    });