import {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {APIError, handleAPIError} from "@siku-zangu/core";
import {selectOneAdminByUserId} from "@siku-zangu/knex";
import {verifyJWT} from "./verify-jwt.function";

export async function GET(req: NextRequest) {
    return handleAPIError(async () => {
        const store = await cookies()
        const ausCookie = store.get('_aus')?.value
        if (!ausCookie) {
            return Response.json({status: 401, message: 'Unauthorised'} as APIError, {
                status: 500,
            });
        }

        const {payload} = await verifyJWT(ausCookie);
        const admin = await selectOneAdminByUserId(payload.aud as string)
        return Response.json(admin, {status: 200})
    })
}