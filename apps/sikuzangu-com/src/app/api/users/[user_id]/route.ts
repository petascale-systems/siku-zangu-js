import {NextRequest} from "next/server";
import {APIError, User} from "@siku-zangu/core";
import {deleteOneUserByUserId, selectOneUserByUserId, updateOneUser} from "@siku-zangu/knex";

export async function GET(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
    const {user_id} = await params
    return selectOneUserByUserId(user_id)
        .then(user => Response.json(user))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
    const {user_id} = await params
    return updateOneUser(user_id, req.body as User)
        .then(user => Response.json(user))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
    const {user_id} = await params
    return deleteOneUserByUserId(user_id)
        .then(page => Response.json(null, {status: 204}))
        .catch(e => {
            if (e.status) return Response.json(e, {status: e.status});

            console.error(`${req.method.toUpperCase()} ${req.url}: `, e)
            return Response.json({status: 500, message: 'Server error'} as APIError, {status: 500});
        })
}
