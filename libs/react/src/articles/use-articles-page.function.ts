'use client';

import { useQuery } from '@tanstack/react-query';
import {APIError, Article, ArticlesFetchParams, Page} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { queryKeys } from '../query-keys.function';

export const ARTICLES_API_PATH = '/api/articles';

export const fetchArticlesPage = (params?: ArticlesFetchParams) =>
  getJSON<Page<Article>>(ARTICLES_API_PATH, params ?? {});

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * A page of articles.
 *
 * `language` has no server-side filter, so it is still applied here. Note that
 * filtering after paging means `totalItems`/`totalPages` describe the unfiltered
 * set — the counts are reported as-is rather than silently rewritten, because
 * the fix belongs in `selectArticlesPage`, not in the client.
 */
export function useArticlesPage(params: ArticlesFetchParams) {
  const query = useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: async () => {
      const page = await fetchArticlesPage(params);
      if (!page || !params.language) return page;
      return {
        ...page,
        items: (page.items ?? []).filter(
          (a) => !a.kv?.language || a.kv.language === params.language
        ),
      };
    },
    placeholderData: (previous) => previous,
  });

  return {
    articlesPage: query.data,
    isFetchingArticlesPage: query.isLoading,
    isRefetchingArticlesPage: query.isFetching && !query.isLoading,
    error: query.error
      ? toMessage(query.error, 'Failed to load articles')
      : null,
    refetchArticlesPage: () => query.refetch(),
  };
}
