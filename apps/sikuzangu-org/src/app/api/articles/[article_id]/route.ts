import { NextRequest } from 'next/server';
import {selectOneArticle, updateOneArticle, deleteOneArticle, scheduleNewArticleNotifications} from '@siku-zangu/knex';
import {APIError, handleAPIError} from '@siku-zangu/core';
import { getSessionAdmin, requireAdmin } from '../../require-auth.function';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ article_id: string }> }
) {
  return handleAPIError(async () => {
    const { article_id } = await params;
    const article = await selectOneArticle(article_id);

    // Don't confirm that an unpublished article exists to a non-admin.
    if (article?.kv?.status !== 'published') {
      const admin = await getSessionAdmin();
      if (!admin) throw { status: 404, message: 'Not found' } as APIError;
    }

    return Response.json(article, { status: 200 });
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ article_id: string }> }
) {
  return handleAPIError(async () => {
    // Publishing an article notifies every subscribed user.
    await requireAdmin();
    const { article_id } = await params;
    const body = await req.json();

    // Check if article is being published
    const previousArticle = await selectOneArticle(article_id);
    const isBeingPublished = previousArticle?.kv?.status !== 'published' && body?.kv?.status === 'published';

    const article = await updateOneArticle(article_id, body);

    // Send notifications when article is published
    if (isBeingPublished) {
      scheduleNewArticleNotifications().catch((error) => {
        console.error('Failed to send new article notifications:', error);
      });
    }

    return Response.json(article, { status: 200 });
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ article_id: string }> }
) {
  return handleAPIError(async () => {
    await requireAdmin();
    const { article_id } = await params;
    await deleteOneArticle(article_id);
    return new Response(null, { status: 204 });
  });
}
