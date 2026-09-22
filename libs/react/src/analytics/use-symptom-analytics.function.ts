'use client';

import { useQuery } from '@tanstack/react-query';
import { getJSON } from '../get-json.function';
import { queryKeys } from '../query-keys.function';

export const ANALYTICS_SYMPTOMS_API_PATH = '/api/analytics/symptoms';

export type SymptomCount = {
  value: string;
  /** How many times it was logged. */
  occurrences: number;
  /** How many distinct people logged it. */
  users: number;
};

export type SymptomsByDate = {
  date: string;
  value: string;
  occurrences: number;
};

export type SymptomAnalytics = {
  counts: SymptomCount[];
  series: SymptomsByDate[];
};

export type SymptomAnalyticsParams = {
  from?: string;
  to?: string;
  byDate?: boolean;
};

export async function fetchSymptomAnalytics(
  params: SymptomAnalyticsParams = {}
) {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.byDate) search.set('byDate', 'true');
  const query = search.toString();
  return getJSON<SymptomAnalytics>(
    query
      ? `${ANALYTICS_SYMPTOMS_API_PATH}?${query}`
      : ANALYTICS_SYMPTOMS_API_PATH
  );
}

/**
 * Symptom totals, counted by the database rather than in the browser.
 *
 * The dashboard used to derive these by looping over the first 500 users and
 * parsing each one's log JSON — which sampled silently, and added a preference
 * set into the same tally as the events.
 *
 * `occurrences` and `users` are separate on purpose: one answers "how often
 * does this happen", the other "how many people report it". Merging them is the
 * bug this replaces.
 */
export function useSymptomAnalytics(params: SymptomAnalyticsParams = {}) {
  const query = useQuery({
    queryKey: queryKeys.analytics.symptoms(params),
    queryFn: () => fetchSymptomAnalytics(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  return {
    symptomCounts: query.data?.counts ?? [],
    symptomSeries: query.data?.series ?? [],
    isFetchingSymptomAnalytics: query.isFetching,
  };
}
