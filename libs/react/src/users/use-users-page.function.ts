'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {APIError, Page, User, UsersFetchParams} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { queryKeys } from '../query-keys.function';
import {
  deleteUserById as _deleteUser,
  updateUser as _updateUser,
  USERS_API_PATH,
} from './use-user.shared';

export const fetchUsersPage = (params?: UsersFetchParams) =>
  getJSON<Page<User>>(USERS_API_PATH, params || {});

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * A page of users.
 *
 * Previously hand-rolled: it spliced mutation results into the local `items`
 * array, which left `totalItems`/`totalPages` stale, and it refetched from a
 * `useEffect` keyed on primitive params with no way to force a refresh. Query
 * invalidates the list after a mutation instead, so the counts stay honest.
 */
export function useUsersPage(params?: UsersFetchParams) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsersPage(params),
    // Keep the previous page on screen while the next one loads rather than
    // flashing an empty table.
    placeholderData: (previous) => previous,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: ({ userId, user }: { userId: string; user: User }) =>
      _updateUser(userId, user),
    onMutate: () => setError(null),
    onSuccess: invalidate,
    onError: (e) => setError(toMessage(e, 'Failed to update user')),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => _deleteUser(userId),
    onMutate: () => setError(null),
    onSuccess: invalidate,
    onError: (e) => setError(toMessage(e, 'Failed to delete user')),
  });

  return {
    usersPage: query.data,
    isFetchingUsersPage: query.isLoading,
    isRefetchingUsersPage: query.isFetching && !query.isLoading,
    isUpdatingUser: updateMutation.isPending,
    isDeletingUser: deleteMutation.isPending,
    error: error ?? (query.error ? toMessage(query.error, 'Failed to load users') : null),
    updateUser: (userId: string, user: User) =>
      updateMutation.mutateAsync({ userId, user }),
    deleteUser: (userId: string) => deleteMutation.mutateAsync(userId),
    refetchUsersPage: () => query.refetch(),
  };
}
