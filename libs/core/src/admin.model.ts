import {User, USER_ZOD_SCHEMA, UserStatus} from "./user.model";
import {z} from 'zod';

export type AdminRole = 'admin' | 'member';
export type Admin = User & {
    status?: UserStatus;
    role?: AdminRole;
};

export const ADMIN_ZOD_SCHEMA = USER_ZOD_SCHEMA.extend({
    status: z.enum(['active', 'inactive']).optional(),
    role: z.enum(['admin', 'member']).optional(),
});