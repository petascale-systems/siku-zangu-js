import {NextRequest} from 'next/server';
import {deleteOneUserPasswordChange, selectOneUserPasswordChange, updateOneUser} from '@siku-zangu/knex';
import {handleAPIError, PASSWORD_ZOD_SCHEMA, zodErrorToApiError} from "@siku-zangu/core";

export async function GET(req: NextRequest, {params}: { params: Promise<{ password_change_id: string }> }) {
    return handleAPIError(async () => {
        const {password_change_id: changeId} = await params;
        const change = await selectOneUserPasswordChange(changeId);
        return Response.json(change, {status: 200});
    })
}

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ password_change_id: string }> }) {
    return handleAPIError(async () => {
        const {password_change_id: changeId} = await params;
        const result = PASSWORD_ZOD_SCHEMA.safeParse(await req.json());
        if (!result.success) return Promise.reject(zodErrorToApiError(result.error));

        const change = await selectOneUserPasswordChange(changeId);
        await updateOneUser(change.user_id!, {kv: {password: result.data.password}})
        return deleteOneUserPasswordChange(changeId);
    })
}