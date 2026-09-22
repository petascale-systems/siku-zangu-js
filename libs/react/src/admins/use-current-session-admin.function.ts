'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {Admin, APIError, EmailAndPassword} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { deleteJSON } from '../delete-json.function';
import { queryKeys } from '../query-keys.function';

export const SESSIONS_API_PATH = '/api/sessions';
export const CURRENT_SESSION_API_PATH = '/api/sessions/current';

export const fetchCurrentSessionAdmin = () =>
  getJSON<Admin>(CURRENT_SESSION_API_PATH);

export const createSession = (formData: EmailAndPassword) =>
  postJSON<EmailAndPassword, Admin>(SESSIONS_API_PATH, formData);

export const deleteCurrentSession = () => deleteJSON(CURRENT_SESSION_API_PATH);

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * The signed-in admin behind the session cookie. Web only — it navigates with
 * the Next router.
 *
 * `error` is new: login failures used to be swallowed by the caller's
 * `.catch(console.log)`, so a wrong password looked like nothing happened.
 */
export function useCurrentSessionAdmin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.session.current(),
    queryFn: fetchCurrentSessionAdmin,
    // An expired session is an expected state, not a transient failure.
    retry: false,
  });

  // A 401 means the cookie is gone or stale; send them to sign in. This has to
  // happen in an effect — navigating during render is a side effect React will
  // warn about and can loop.
  const status = (query.error as APIError | null)?.status;
  useEffect(() => {
    if (status === 401) router.push('/login');
  }, [status, router]);

  const loginMutation = useMutation({
    mutationFn: createSession,
    onMutate: () => setError(null),
    onSuccess: (admin) => {
      queryClient.setQueryData(queryKeys.session.current(), admin);
      router.push('/dashboard');
    },
    onError: (e) => setError(toMessage(e, 'Could not sign in')),
  });

  const logoutMutation = useMutation({
    mutationFn: deleteCurrentSession,
    onSuccess: () => {
      // Drop every cached query, not just the session: the next admin to sign
      // in on this browser must not see the previous one's data.
      queryClient.clear();
      router.push('/login');
    },
    onError: (e) => setError(toMessage(e, 'Could not sign out')),
  });

  return {
    admin: query.data,
    isFetchingAdmin: query.isLoading,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    error,
    login: (formData: EmailAndPassword) => loginMutation.mutateAsync(formData),
    logout: () => logoutMutation.mutateAsync(),
  };
}
