import {User, USER_ZOD_SCHEMA, UserStatus} from "./user.model";
import {z} from 'zod'

export type Admin = User & {
    status?: UserStatus;
}

export const ADMIN_ZOD_SCHEMA = z
    .object({status: z.enum(['active', 'inactive']).optional()})
    .extend(USER_ZOD_SCHEMA)