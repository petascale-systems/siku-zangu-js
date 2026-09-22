'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {APIError} from '@siku-zangu/core';

/**
 * TanStack Query, shared by the web app and the mobile app.
 *
 * There used to be one of these per platform, which meant the retry and
 * staleness policy was written twice and had already drifted. Query itself is
 * platform-agnostic; the only genuinely native part is telling it when the app
 * regains focus, which `useNUIAppStateFocus` handles on mobile.
 *
 * The client is created in state rather than at module scope so it is not
 * shared between requests during server rendering — a module-level client
 * would leak one user's cached data into another's response.
 */
function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // Retrying a 4xx just delays the inevitable, and for an expired
            // session it delays the redirect to sign-in.
            retry: (failureCount, error) => {
              const status = (error as APIError)?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export const XUIQuery = { Provider };
