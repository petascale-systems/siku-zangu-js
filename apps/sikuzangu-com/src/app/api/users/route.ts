import {NextRequest} from "next/server";
import {APIError, User} from "@siku-zangu/core";
import {insertOneUser, selectUsersPage} from "@siku-zangu/knex";

export async function POST(req: NextRequest) {
    return insertOneUser(req.body as User)
        .then(user => Response.json(user, {status: 201}))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}

export async function GET(req: NextRequest) {
    return selectUsersPage(
        {
            page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
            size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
            q: req.nextUrl.searchParams.get('q') || ''
        })
        .then(page => Response.json(page))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}
