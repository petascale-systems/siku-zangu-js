import {AdminsFetchParams, ArticlesFetchParams, UsersFetchParams} from '@siku-zangu/core';

/**
 * Query keys for every cached resource, in one place.
 *
 * Keys are built here rather than inline at each call site so a mutation can
 * invalidate the exact thing it changed. A list key includes its fetch params,
 * so paging or searching is a separate cache entry; the bare prefix
 * (`users.lists()`) invalidates every page at once after a create or delete.
 */
export const queryKeys = {
    analytics: {
        all: () => ['analytics'] as const,
        symptoms: (params?: unknown) =>
            ['analytics', 'symptoms', params ?? {}] as const,
    },
  users: {
    all: () => ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (params?: UsersFetchParams) => ['users', 'list', params ?? {}] as const,
    detail: (userId?: string) => ['users', 'detail', userId] as const,
    periodHistory: (userId?: string) =>
      ['users', 'detail', userId, 'period-history'] as const,
  },
  admins: {
    all: () => ['admins'] as const,
    lists: () => ['admins', 'list'] as const,
    list: (params?: AdminsFetchParams) =>
      ['admins', 'list', params ?? {}] as const,
    detail: (userId?: string) => ['admins', 'detail', userId] as const,
  },
  articles: {
    all: () => ['articles'] as const,
    lists: () => ['articles', 'list'] as const,
    list: (params?: ArticlesFetchParams) =>
      ['articles', 'list', params ?? {}] as const,
    detail: (articleId?: string) => ['articles', 'detail', articleId] as const,
  },
  session: {
    current: () => ['session', 'current'] as const,
  },
  passwordChanges: {
    detail: (id?: string) => ['password-changes', 'detail', id] as const,
  },
} as const;
