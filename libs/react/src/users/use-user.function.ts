"use client"

import {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../query-keys.function';
import {APIError, User} from '@siku-zangu/core';
import {
    USERS_API_PATH,
    USER_BY_ID_API_PATH,
    CHANGE_PIN_API_PATH,
    REQUEST_PIN_RESET_API_PATH,
    VERIFY_OTP_API_PATH,
    RESET_PIN_API_PATH,
    fetchUserById,
    createUser,
    updateUser,
    deleteUserById,
    changeUserPin,
    requestPinReset,
    verifyPinResetOtp,
    resetUserPin,
} from './use-user.shared';
export {
    USERS_API_PATH,
    USER_BY_ID_API_PATH,
    CHANGE_PIN_API_PATH,
    REQUEST_PIN_RESET_API_PATH,
    VERIFY_OTP_API_PATH,
    RESET_PIN_API_PATH,
    createUser,
    updateUser,
    deleteUserById,
    changeUserPin,
    requestPinReset,
    verifyPinResetOtp,
    resetUserPin,
};

const toMessage = (e: unknown, fallback: string): string =>
    (e as APIError)?.issues?.map((issue: any) => issue.error).join(', ') ||
    (e as APIError)?.message ||
    fallback;

/**
 * Single source of truth for the signed-in user.
 *
 * Backed by TanStack Query rather than per-screen `useState`. That matters
 * because every screen calls this hook independently: previously each held its
 * own copy, so saving on one screen left the others stale until their own
 * refetch window elapsed, and a GET racing a PATCH could overwrite a
 * just-saved record with the pre-save body. The shared cache and Query's
 * request sequencing remove both classes of bug.
 *
 * The returned shape is unchanged from the hand-rolled version so screens did
 * not need touching.
 *
 * This used to be split into `.native.ts` and `.web.ts` with two separate
 * hand-rolled implementations that had drifted apart — the web build was
 * missing the PIN-reset calls entirely, and TypeScript checked the web file
 * while Metro ran the native one. Query is platform-agnostic, so both
 * platforms now share this single file.
 */
export function useUser(userId?: string) {
    const queryClient = useQueryClient();
    // Mutation errors are surfaced through the same `error` field the screens
    // already read, so a failed save cannot look like a success.
    const [mutationError, setMutationError] = useState<string | null>(null);

    const query = useQuery({
        queryKey: queryKeys.users.detail(userId),
        queryFn: () => fetchUserById(userId as string),
        enabled: !!userId,
        staleTime: 3 * 60 * 1000,
        // The app is offline-prone; keep showing the last good record rather
        // than blanking the dashboard while a refetch is in flight.
        placeholderData: (previous) => previous,
    });

    const setUser = useCallback(
        (next: User | undefined) => {
            queryClient.setQueryData(queryKeys.users.detail(userId), next);
        },
        [queryClient, userId]
    );

    const upsertMutation = useMutation({
        mutationFn: async (userData: Partial<User>) =>
            userId
                ? await updateUser(userId, userData as User)
                : await createUser(userData as User),
        onMutate: () => setMutationError(null),
        onSuccess: (upsertedUser) => {
            if (upsertedUser) {
                setUser(upsertedUser);
            } else {
                // A void or partial response would otherwise leave every other
                // screen on stale data; force a refetch instead.
                queryClient.invalidateQueries({
                    queryKey: queryKeys.users.detail(userId),
                });
            }
            // Any list showing this user is now stale, and so is the period
            // history if a period day was just marked.
            queryClient.invalidateQueries({queryKey: queryKeys.users.lists()});
            queryClient.invalidateQueries({queryKey: queryKeys.users.periodHistory(userId)});
        },
        onError: (e) => setMutationError(toMessage(e, 'Failed to upsert user')),
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!userId) return;
            await deleteUserById(userId);
        },
        onMutate: () => setMutationError(null),
        onSuccess: () => {
            // Remove rather than set undefined: a cached `undefined` would make
            // later mounts render an empty state with no loading indicator.
            queryClient.removeQueries({queryKey: queryKeys.users.detail(userId)});
            queryClient.invalidateQueries({queryKey: queryKeys.users.lists()});
        },
        onError: (e) => setMutationError(toMessage(e, 'Failed to delete user')),
    });

    const changePinMutation = useMutation({
        mutationFn: async ({currentPin, newPin}: {currentPin: string; newPin: string}) => {
            if (!userId) throw new Error('User ID is required to change PIN');
            return await changeUserPin(userId, currentPin, newPin);
        },
        onMutate: () => setMutationError(null),
        onSuccess: (updatedUser) => {
            if (updatedUser) setUser(updatedUser);
        },
        onError: (e) => setMutationError(toMessage(e, 'Failed to change PIN')),
    });

    const sendResetMutation = useMutation({
        mutationFn: (phoneNumber: string) => requestPinReset(phoneNumber),
        onMutate: () => setMutationError(null),
        onError: (e) => setMutationError(toMessage(e, 'Failed to send reset code')),
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({phoneNumber, code}: {phoneNumber: string; code: string}) =>
            verifyPinResetOtp(phoneNumber, code),
        onMutate: () => setMutationError(null),
        onError: (e) => setMutationError(toMessage(e, 'Failed to verify code')),
    });

    const resetPinMutation = useMutation({
        mutationFn: ({phoneNumber, resetToken, newPin}: {
            phoneNumber: string;
            resetToken: string;
            newPin: string;
        }) => resetUserPin(phoneNumber, resetToken, newPin),
        onMutate: () => setMutationError(null),
        onSuccess: (updatedUser) => {
            if (updatedUser) setUser(updatedUser);
        },
        onError: (e) => setMutationError(toMessage(e, 'Failed to reset PIN')),
    });

    const upsertUser = useCallback(
        (userData: Partial<User>) => upsertMutation.mutateAsync(userData),
        [upsertMutation]
    );

    /**
     * Update only. Rejects when there is no user id rather than falling through
     * to createUser, which would silently make a second account if called
     * before the stored token had loaded.
     */
    const updateCurrentUser = useCallback(
        (userData: Partial<User>) => {
            if (!userId) {
                return Promise.reject({
                    status: 409,
                    message: 'No signed-in user to update',
                } as APIError);
            }
            return upsertMutation.mutateAsync(userData);
        },
        [upsertMutation, userId]
    );

    const deleteUser = useCallback(
        async () => {
            await deleteMutation.mutateAsync();
        },
        [deleteMutation]
    );

    const changePin = useCallback(
        (currentPin: string, newPin: string) =>
            changePinMutation.mutateAsync({currentPin, newPin}),
        [changePinMutation]
    );

    const sendResetCode = useCallback(
        (phoneNumber: string) => sendResetMutation.mutateAsync(phoneNumber),
        [sendResetMutation]
    );

    const verifyResetCode = useCallback(
        (phoneNumber: string, code: string) =>
            verifyOtpMutation.mutateAsync({phoneNumber, code}),
        [verifyOtpMutation]
    );

    const submitNewPin = useCallback(
        (phoneNumber: string, resetToken: string, newPin: string) =>
            resetPinMutation.mutateAsync({phoneNumber, resetToken, newPin}),
        [resetPinMutation]
    );

    // `isBackground` is honoured now; the previous implementation accepted the
    // argument and always ran a blocking fetch, so the background spinners on
    // Home and Personal Info were unreachable.
    // Goes through the client rather than `query.refetch`, so this keeps a
    // stable identity. `query` is a new object every render, which made
    // refetchUser change every render — and screens list it in the deps of a
    // useFocusEffect, so the focus effect re-ran constantly and was relying on
    // its own staleness gate to avoid a refetch loop.
    const refetchUser = useCallback(
        async (_isBackground = true) => {
            if (!userId) return;
            await queryClient.refetchQueries({
                queryKey: queryKeys.users.detail(userId),
            });
            return queryClient.getQueryData<User>(queryKeys.users.detail(userId));
        },
        [queryClient, userId]
    );

    const isInitialFetching = query.isLoading;
    const isBackgroundFetching = query.isFetching && !query.isLoading;

    return {
        user: query.data,
        /**
         * When the cached record last arrived, as a timestamp (0 before the
         * first success). Screens refetch on tab focus, which Query cannot
         * observe on its own, and need to know how old the data is to decide.
         * A hand-rolled `useRef(0)` cannot: it reads as infinitely stale on the
         * first focus, so every screen fired a background refetch on top of its
         * initial load — two loading states on first open.
         */
        userUpdatedAt: query.dataUpdatedAt,
        isFetchingUser: query.isFetching,
        isInitialFetching,
        isBackgroundFetching,
        isUpsertingUser: upsertMutation.isPending,
        isDeletingUser: deleteMutation.isPending,
        isChangingPin: changePinMutation.isPending,
        isRequestingReset: sendResetMutation.isPending,
        isVerifyingOtp: verifyOtpMutation.isPending,
        isResettingPin: resetPinMutation.isPending,
        error: mutationError ?? (query.error ? toMessage(query.error, 'Failed to fetch user') : null),
        upsertUser,
        updateCurrentUser,
        deleteUser,
        changePin,
        sendResetCode,
        verifyResetCode,
        submitNewPin,
        refetchUser,
    };
}
