import { NextRequest } from 'next/server';
import { selectOneArticle, updateOneArticle, scheduleNewArticleNotifications } from '@siku-zangu/knex';
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
