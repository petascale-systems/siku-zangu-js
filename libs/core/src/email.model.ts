import {z} from "zod";

export type Email = {
    email: string;
}

export const EMAIL_ZOD_SCHEMA = z.object({
    email: z.email()
})