import {NextRequest} from "next/server";
import {APIError, Article, ArticleStatus, handleAPIError} from "@siku-zangu/core";
import {insertOneArticle, selectArticlesPage, selectOneAdminByUserId} from "@siku-zangu/knex";
import {cookies} from "next/headers";
import {verifyJWT} from "../sessions/current/verify-jwt.function";

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const body = (await req.json()) as Article;
        const store = await cookies()
        const ausCookie = store.get('_aus')?.value
        if (!ausCookie) {
            return Response.json({status: 401, message: 'Unauthorised'} as APIError, {
                status: 500,
            });
        }

        const {payload} = await verifyJWT(ausCookie);
        const admin = await selectOneAdminByUserId(payload.aud as string)
        if (body.kv) body.kv.author = `${admin?.kv?.first_name} ${admin?.kv?.last_name}`;
        const user = await insertOneArticle(body);
        return Response.json(user, {status: 201});
    })
}

export async function GET(req: NextRequest) {
    return handleAPIError(async () => {
        const page = await selectArticlesPage({
            page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
            size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
            q: req.nextUrl.searchParams.get('q') || '',
            status: req.nextUrl.searchParams.get('status') as ArticleStatus,
        });

        return Response.json(page, {status: 200});
    })
}