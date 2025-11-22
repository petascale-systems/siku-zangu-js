import {insertOneAdmin, insertOneUserPasswordChange, selectAdminsPage} from "@siku-zangu/knex";
import {NextRequest} from "next/server";
import {Admin, AdminRole, handleAPIError} from "@siku-zangu/core";
import {sendAdminInvite} from "@siku-zangu/brevo";

export async function GET(req: NextRequest) {
    return handleAPIError(async () => {
        const page = await selectAdminsPage({
            page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
            size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
            q: req.nextUrl.searchParams.get('q') || '',
            role: req.nextUrl.searchParams.get('status') as AdminRole,
        });

        return Response.json(page);
    })
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const body = (await req.json()) as Admin;
        const admin = await insertOneAdmin(body);
        const pwdChange = await insertOneUserPasswordChange(admin.user_id!)
        await sendAdminInvite({
            toEmail: admin.kv?.email,
            toName: admin.kv?.first_name,
            link: `${req?.headers?.get('origin') || 'https://sikuzangu.org'}/password-changes/${pwdChange.password_change_id}`
        })
        return Response.json(admin, {status: 201});
    })
}