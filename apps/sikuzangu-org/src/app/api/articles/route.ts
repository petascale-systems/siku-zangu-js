import { NextRequest } from 'next/server';
import {APIError, Article, ArticleStatus, handleAPIError} from '@siku-zangu/core';
import {insertOneArticle, selectArticlesPage, selectOneAdminByUserId} from '@siku-zangu/knex';
import { getSessionAdmin, requireAdmin } from '../require-auth.function';

export async function POST(req: NextRequest) {
  return handleAPIError(async () => {
    // Was returning a 401 body with a 500 status, so clients saw a server
    // error rather than an auth failure.
    const admin = await requireAdmin();
    const body = (await req.json()) as Article;
    if (body.kv)
      body.kv.author = `${admin?.kv?.first_name} ${admin?.kv?.last_name}`;
    const user = await insertOneArticle(body);
    return Response.json(user, { status: 201 });
  });
}

export async function GET(req: NextRequest) {
  return handleAPIError(async () => {
    // Anyone could previously read unpublished work with ?status=draft.
    // Non-admins are pinned to published regardless of what they ask for.
    const admin = await getSessionAdmin();
    const requestedStatus = req.nextUrl.searchParams.get(
      'status'
    ) as ArticleStatus;

    const page = await selectArticlesPage({
      page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
      size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
      q: req.nextUrl.searchParams.get('q') || '',
      status: admin ? requestedStatus : ('published' as ArticleStatus),
    });

    return Response.json(page, { status: 200 });
  });
}
