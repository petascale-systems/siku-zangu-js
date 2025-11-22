import {NextRequest} from "next/server";
import {EMAIL_ZOD_SCHEMA, handleAPIError, zodErrorToApiError} from "@siku-zangu/core";
import {insertOneUserPasswordChange, selectUserIdByEmail} from "@siku-zangu/knex";
import {sendAdminPasswordResetLink} from "@siku-zangu/brevo";
import {FETCH_CONFIG} from "@siku-zangu/react";

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const result = EMAIL_ZOD_SCHEMA.safeParse(await req.json())
        if (!result.success) return Promise.reject(zodErrorToApiError(result.error));

        const userId = await selectUserIdByEmail(result.data.email)
        const pwdChange = await insertOneUserPasswordChange(userId);
        await sendAdminPasswordResetLink({
            toEmail: result.data.email,
            link: `${FETCH_CONFIG.host}/password-changes/${pwdChange.password_change_id}`
        })

        return Response.json(result.data, {status: 201})
    })
}