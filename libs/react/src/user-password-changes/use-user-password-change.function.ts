'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {APIError, Email, Password, UserPasswordChange} from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { patchJSON } from '../patch-json.function';
import { queryKeys } from '../query-keys.function';

export const USER_PASSWORD_CHANGES_API_PATH = '/api/password-changes';
export const USER_PASSWORD_CHANGE_BY_ID_API_PATH = (id: string) =>
  `/api/password-changes/${id}`;

export const fetchPasswordChange = (passwordChangeId: string) =>
  getJSON<UserPasswordChange>(
    USER_PASSWORD_CHANGE_BY_ID_API_PATH(passwordChangeId)
  );

export const submitPasswordChange = (
  passwordChangeId: string,
  password: Password
) =>
  patchJSON<Password, void>(
    USER_PASSWORD_CHANGE_BY_ID_API_PATH(passwordChangeId),
    password
  );

export const requestPasswordChange = (email: Email) =>
  postJSON<Email, Email>(USER_PASSWORD_CHANGES_API_PATH, email);

const toMessage = (e: unknown, fallback: string) =>
  (e as APIError)?.message || fallback;

/**
 * The password-reset token flow. Web only — it navigates with the Next router.
 *
 * A reset link is single use: the PATCH consumes the token server-side, so
 * there is nothing to refetch afterwards and the user is sent to sign in.
 */
export function useUserPasswordChange(passwordChangeId?: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.passwordChanges.detail(passwordChangeId),
    queryFn: () => fetchPasswordChange(passwordChangeId as string),
    enabled: !!passwordChangeId,
    // An expired or already-used link is a definite answer, not a blip.
    retry: false,
  });

  // A link that no longer resolves cannot be completed; send them to sign in.
  const failed = !!query.error;
  useEffect(() => {
    if (failed) router.push('/login');
  }, [failed, router]);

  const changeMutation = useMutation({
    mutationFn: (password: Password) =>
      submitPasswordChange(passwordChangeId as string, password),
    onMutate: () => setError(null),
    onSuccess: () => router.push('/login'),
    onError: (e) => setError(toMessage(e, 'Could not set your password')),
  });

  const createMutation = useMutation({
    mutationFn: requestPasswordChange,
    onMutate: () => setError(null),
    onError: (e) => setError(toMessage(e, 'Could not send the reset email')),
  });

  return {
    passwordChange: query.data,
    isFetchingPasswordChange: query.isLoading,
    isChangingPassword: changeMutation.isPending,
    isCreatingPasswordChange: createMutation.isPending,
    error,
    changePassword: (password: Password) =>
      changeMutation.mutateAsync(password),
    createPasswordChange: (email: Email) => createMutation.mutateAsync(email),
  };
}
