import { NextRequest } from 'next/server';
import { selectOneArticle, updateOneArticle } from '@siku-zangu/knex';
import { handleAPIError } from '@siku-zangu/core';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ article_id: string }> }
) {
  return handleAPIError(async () => {
    const { article_id } = await params;
    const user = await selectOneArticle(article_id);
    return Response.json(user, { status: 200 });
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ article_id: string }> }
) {
  return handleAPIError(async () => {
    const { article_id } = await params;
    const body = await req.json();
    const user = await updateOneArticle(article_id, body);
    return Response.json(user, { status: 200 });
  });
}
