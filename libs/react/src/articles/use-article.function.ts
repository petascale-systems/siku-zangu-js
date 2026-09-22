'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {APIError, Article} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { patchJSON } from '../patch-json.function';
import { deleteJSON } from '../delete-json.function';
import { FETCH_CONFIG } from '../create-fetch-config.function';
import { authHeaders } from '../auth-token.function';
import { queryKeys } from '../query-keys.function';
import { ARTICLES_API_PATH } from './use-articles-page.function';

export const ARTICLE_BY_ID_API_PATH = (id?: string) =>
  `${ARTICLES_API_PATH}/${id}`;
export const ARTICLE_COVER_IMAGE_API_PATH = (id?: string) =>
  `${ARTICLES_API_PATH}/${id}/cover-image`;

/** `new` is the sentinel the editor route uses before an article exists. */
const NEW = 'new';
const isSaved = (id?: string): id is string => !!id && id !== NEW;

export const fetchArticle = (articleId: string) =>
  getJSON<Article>(ARTICLE_BY_ID_API_PATH(articleId));

export const createArticle = (article: Article) =>
  postJSON<Article, Article>(ARTICLES_API_PATH, article);

export const updateArticle = (articleId: string, article: Article) =>
  patchJSON<Article, Article>(ARTICLE_BY_ID_API_PATH(articleId), article);

export const deleteArticle = (articleId: string) =>
  deleteJSON(ARTICLE_BY_ID_API_PATH(articleId));

export async function updateArticleCoverImage(articleId: string, img: File) {
  const data = new FormData();
  data.append('cover_image', img);

  // Goes through FETCH_CONFIG.host like every other call — this previously used
  // a bare relative path, which only worked same-origin.
  const path = `${FETCH_CONFIG.host}${ARTICLE_COVER_IMAGE_API_PATH(articleId)}`;
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: { ...authHeaders() },
    body: data,
  });
  if (res.ok) return;

  let err: APIError;
  try {
    err = await res.json();
  } catch {
    err = { status: res.status as APIError['status'], message: res.statusText };
  }
  return Promise.reject(err);
}

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * A single article, with create/update/delete.
 *
 * Mutations invalidate both this article and every article list, so the
 * dashboard grid reflects a publish or delete without a manual refresh.
 */
export function useArticle(articleId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.articles.detail(articleId),
    queryFn: () => fetchArticle(articleId as string),
    enabled: isSaved(articleId),
  });

  const invalidate = useCallback(
    (id?: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.articles.detail(id),
        });
      }
    },
    [queryClient]
  );

  const createMutation = useMutation({
    mutationFn: async ({
      article,
      coverImage,
    }: {
      article: Article;
      coverImage?: File;
    }) => {
      const created = await createArticle(article);
      if (coverImage && created?.article_id) {
        await updateArticleCoverImage(created.article_id, coverImage);
      }
      return created;
    },
    onMutate: () => setError(null),
    onSuccess: (created) => {
      if (created?.article_id) {
        queryClient.setQueryData(
          queryKeys.articles.detail(created.article_id),
          created
        );
      }
      invalidate(created?.article_id);
    },
    onError: (e) => setError(toMessage(e, 'Failed to create article')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      article,
      coverImage,
    }: {
      article: Article;
      coverImage?: File;
    }) => {
      if (!isSaved(articleId)) {
        throw { status: 400, message: 'No article id. Use createArticle.' } as APIError;
      }
      const updated = await updateArticle(articleId, article);
      if (coverImage) await updateArticleCoverImage(articleId, coverImage);
      return updated;
    },
    onMutate: () => setError(null),
    onSuccess: () => invalidate(articleId),
    onError: (e) => setError(toMessage(e, 'Failed to update article')),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!isSaved(articleId)) {
        throw { status: 400, message: 'No article id.' } as APIError;
      }
      return deleteArticle(articleId);
    },
    onMutate: () => setError(null),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.articles.detail(articleId),
      });
      invalidate();
    },
    onError: (e) => setError(toMessage(e, 'Failed to delete article')),
  });

  return {
    article: query.data,
    isFetchingArticle: query.isLoading,
    isCreatingArticle: createMutation.isPending,
    isUpdatingArticle: updateMutation.isPending,
    isDeletingArticle: deleteMutation.isPending,
    error: error ?? (query.error ? toMessage(query.error, 'Failed to load article') : null),
    createArticle: (article: Article, coverImage?: File) =>
      createMutation.mutateAsync({ article, coverImage }),
    updateArticle: (article: Article, coverImage?: File) =>
      updateMutation.mutateAsync({ article, coverImage }),
    deleteArticle: () => deleteMutation.mutateAsync(),
    refetchArticle: () => query.refetch(),
  };
}
