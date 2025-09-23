import {NextRequest} from "next/server";
import {APIError, USER_ZOD_SCHEMA} from "@siku-zangu/core";

export async function POST(req: NextRequest) {
    const result = USER_ZOD_SCHEMA.safeParse(req.body)
    if (!result.success) {
        return Response.json({message: 'Bad request', issues: []} as APIError, {status: 400});
    }

    return new Response('Hello, from API!');
}

export async function GET(request: NextRequest) {
    return new Response('Hello, from API!');
}
