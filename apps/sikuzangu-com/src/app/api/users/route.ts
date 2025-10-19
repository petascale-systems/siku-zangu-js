import {NextRequest} from 'next/server';
import {handleAPIError, User, USER_ZOD_SCHEMA} from '@siku-zangu/core';
import {insertOneUser, selectUsersPage} from '@siku-zangu/knex';

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const body = await req.json();
        const validation = USER_ZOD_SCHEMA.safeParse(body);
        if (!validation.success) {
            const issues = validation.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            return Promise.reject({status: 400, message: 'Invalid user data', issues: issues})
        }

        const user = await insertOneUser(body as User);
        return Response.json(user, {status: 201});
    })
}

export async function GET(req: NextRequest) {
    return handleAPIError(async () => {
        const page = await selectUsersPage({
            page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
            size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
            q: req.nextUrl.searchParams.get('q') || '',
        });

        return Response.json(page, {status: 200});
    })
}
