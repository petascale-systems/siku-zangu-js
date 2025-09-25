import {NextRequest} from "next/server";
import {APIError, User} from "@siku-zangu/core";
import {insertOneUser, selectUsersPage} from "@siku-zangu/knex";

/**
 * This function tries to create a new User.
 *
 * On success HTTP 201 and a user is returned. On fail, an APIError is returned with the appropriate HTTP error code.
 * @param req HTTP request.
 */
export async function POST(req: NextRequest) {
    return insertOneUser(req.body as User)
        .then(user => Response.json(user, {status: 201}))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error('users/POST() => ', e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}

/**
 * Fetches a paginated list of Users. This function supports searching and filtering.
 * @param req HTTP request.
 */
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

            console.error('users/GET() => ', e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}
