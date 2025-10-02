import {NextRequest} from 'next/server';
import {APIError, User} from '@siku-zangu/core';
import {insertOneUser, selectUsersPage} from '@siku-zangu/knex';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const user = await insertOneUser(body as User);
        return Response.json(user, {status: 201});
    } catch (e: any) {
        if (e.status) return Response.json(e, {status: e.status});

        console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
        return Response.json({status: 500, message: 'Server error', details: e.message} as APIError, {
            status: 500,
        });
    }
}

export async function GET(req: NextRequest) {
    try {
        const page = await selectUsersPage({
            page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
            size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
            q: req.nextUrl.searchParams.get('q') || '',
        });

        return Response.json(page, {status: 200});
    } catch (e: any) {
        if (e.status) return Response.json(e, {status: e.status});

        console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
        return Response.json({status: 500, message: 'Server error', details: e.message} as APIError, {
            status: 500,
        });
    }
}