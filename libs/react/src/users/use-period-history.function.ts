"use client"

import {useQuery} from '@tanstack/react-query';
import {APIError, PeriodHistoryCycle} from '@siku-zangu/core';
import {queryKeys} from '../query-keys.function';
import {fetchPeriodHistory} from './use-user.shared';

const NO_CYCLES: PeriodHistoryCycle[] = [];

/**
 * The signed-in user's past cycles, newest first.
 *
 * Cached under the user's detail key, so it goes when the user does. Saving
 * the user invalidates it (see `useUser`), which is what refreshes the history
 * after a period day is marked.
 */
export function usePeriodHistory(userId?: string) {
    const query = useQuery({
        queryKey: queryKeys.users.periodHistory(userId),
        queryFn: () => fetchPeriodHistory(userId as string),
        enabled: !!userId,
        staleTime: 3 * 60 * 1000,
        placeholderData: (previous) => previous,
    });

    return {
        cycles: query.data ?? NO_CYCLES,
        isLoading: query.isLoading,
        error: query.error ? ((query.error as APIError)?.message ?? 'Failed to load period history') : null,
        refetch: query.refetch,
    };
}
