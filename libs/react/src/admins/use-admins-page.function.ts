'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {Admin, AdminsFetchParams, APIError, Page} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { patchJSON } from '../patch-json.function';
import { deleteJSON } from '../delete-json.function';
import { queryKeys } from '../query-keys.function';

export const ADMINS_API_PATH = '/api/admins';
export const ADMIN_BY_ID_API_PATH = (userId: string) => `/api/admins/${userId}`;

export const fetchAdminsPage = (params?: AdminsFetchParams) =>
  getJSON<Page<Admin>>(ADMINS_API_PATH, params || {});

export const createAdmin = (admin: Admin) =>
  postJSON<Admin, Admin>(ADMINS_API_PATH, admin);

export const updateAdmin = (userId: string, admin: Admin) =>
  patchJSON<Admin, Admin>(ADMIN_BY_ID_API_PATH(userId), admin);

export const deleteAdmin = (userId: string) =>
  deleteJSON(ADMIN_BY_ID_API_PATH(userId));

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * A page of admins, with full CRUD.
 *
 * The hand-rolled version appended and filtered `items` locally without
 * touching `totalItems`/`totalPages`, so the counts drifted as soon as you
 * created or deleted anything. Invalidating the list keeps them correct.
 */
export function useAdminsPage(params?: AdminsFetchParams) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.admins.list(params),
    queryFn: () => fetchAdminsPage(params),
    placeholderData: (previous) => previous,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admins.all() });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onMutate: () => setError(null),
    onSuccess: invalidate,
    onError: (e) => setError(toMessage(e, 'Failed to create admin')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, admin }: { userId: string; admin: Admin }) =>
      updateAdmin(userId, admin),
    onMutate: () => setError(null),
    onSuccess: invalidate,
    onError: (e) => setError(toMessage(e, 'Failed to update admin')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onMutate: () => setError(null),
    onSuccess: invalidate,
    onError: (e) => setError(toMessage(e, 'Failed to delete admin')),
  });

  return {
    adminsPage: query.data,
    isFetchingAdminsPage: query.isLoading,
    isRefetchingAdminsPage: query.isFetching && !query.isLoading,
    isCreatingAdmin: createMutation.isPending,
    isUpdatingAdmin: updateMutation.isPending,
    isDeletingAdmin: deleteMutation.isPending,
    error: error ?? (query.error ? toMessage(query.error, 'Failed to load admins') : null),
    createAdmin: (admin: Admin) => createMutation.mutateAsync(admin),
    updateAdmin: (userId: string, admin: Admin) =>
      updateMutation.mutateAsync({ userId, admin }),
    deleteAdmin: (userId: string) => deleteMutation.mutateAsync(userId),
    refetchAdminsPage: () => query.refetch(),
  };
}
