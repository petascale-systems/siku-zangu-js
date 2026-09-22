import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser } from '../use-user.function';
import * as shared from '../use-user.shared';

jest.mock('../use-user.shared', () => ({
  ...jest.requireActual('../use-user.shared'),
  fetchUserById: jest.fn(),
  updateUser: jest.fn(),
  createUser: jest.fn(),
  deleteUserById: jest.fn(),
}));

const mocked = shared as jest.Mocked<typeof shared>;

const wrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

const newClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const USER = { user_id: 'u1', kv: { first_name: 'Amina' } };

describe('useUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches the user by id', async () => {
    mocked.fetchUserById.mockResolvedValue(USER as never);
    const { result } = renderHook(() => useUser('u1'), {
      wrapper: wrapper(newClient()),
    });
    await waitFor(() => expect(result.current.user).toEqual(USER));
    expect(mocked.fetchUserById).toHaveBeenCalledWith('u1');
  });

  it('does not fetch without an id', () => {
    renderHook(() => useUser(undefined), { wrapper: wrapper(newClient()) });
    expect(mocked.fetchUserById).not.toHaveBeenCalled();
  });

  // The reason this hook moved to Query: every screen used to hold its own
  // copy, so saving on one left the others stale.
  it('shares one cache across all consumers of the same id', async () => {
    mocked.fetchUserById.mockResolvedValue(USER as never);
    const client = newClient();
    const a = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
    const b = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });

    await waitFor(() => expect(a.result.current.user).toEqual(USER));
    expect(b.result.current.user).toEqual(USER);
    // One request serves both consumers.
    expect(mocked.fetchUserById).toHaveBeenCalledTimes(1);
  });

  it('propagates a save from one consumer to another', async () => {
    const updated = { user_id: 'u1', kv: { first_name: 'Zawadi' } };
    mocked.fetchUserById.mockResolvedValue(USER as never);
    mocked.updateUser.mockResolvedValue(updated as never);

    const client = newClient();
    const a = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
    const b = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
    await waitFor(() => expect(a.result.current.user).toEqual(USER));

    await act(async () => {
      await a.result.current.upsertUser({ kv: { first_name: 'Zawadi' } });
    });

    // Separate renderHook calls are separate React roots, so b's re-render
    // flushes independently of a's act().
    await waitFor(() => expect(b.result.current.user).toEqual(updated));
  });

  it('creates when there is no id and updates when there is', async () => {
    mocked.createUser.mockResolvedValue(USER as never);
    const { result } = renderHook(() => useUser(undefined), {
      wrapper: wrapper(newClient()),
    });
    await act(async () => {
      await result.current.upsertUser({ kv: { first_name: 'Amina' } });
    });
    expect(mocked.createUser).toHaveBeenCalled();
    expect(mocked.updateUser).not.toHaveBeenCalled();
  });

  // A failed save must not look like a success.
  it('surfaces a mutation failure through error', async () => {
    mocked.fetchUserById.mockResolvedValue(USER as never);
    mocked.updateUser.mockRejectedValue({ message: 'Server exploded' });

    const { result } = renderHook(() => useUser('u1'), {
      wrapper: wrapper(newClient()),
    });
    await waitFor(() => expect(result.current.user).toEqual(USER));

    await act(async () => {
      await result.current
        .upsertUser({ kv: { first_name: 'X' } })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.error).toBe('Server exploded'));
  });

  // A cached `undefined` made later mounts render an empty state with no
  // spinner, which reads as "your account is gone".
  it('removes the cache entry on delete rather than caching undefined', async () => {
    mocked.fetchUserById.mockResolvedValue(USER as never);
    mocked.deleteUserById.mockResolvedValue(undefined as never);

    // gcTime 0 so the entry is collected as soon as the observer detaches,
    // making removal observable rather than waiting out the default 5 minutes.
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    const { result, unmount } = renderHook(() => useUser('u1'), {
      wrapper: wrapper(client),
    });
    await waitFor(() => expect(result.current.user).toEqual(USER));

    await act(async () => {
      await result.current.deleteUser();
    });

    // While the hook is still mounted its observer immediately re-creates the
    // entry, so unmount first — this mirrors the real flow, where a delete is
    // followed by navigating away.
    unmount();

    await waitFor(() =>
      expect(
        client.getQueryCache().find({ queryKey: ['users', 'detail', 'u1'] })
      ).toBeUndefined()
    );
  });

  // The reported bug: saving on Log Entry left Home showing old data.
  describe('a save is visible on every other screen', () => {
    it('updates a second screen from the response body', async () => {
      const saved = {
        user_id: 'u1',
        kv: { first_name: 'Amina', mood_logs: [{ mood: 'calm', timestamp: 'x' }] },
      };
      mocked.fetchUserById.mockResolvedValue(USER as never);
      mocked.updateUser.mockResolvedValue(saved as never);

      const client = newClient();
      const logEntry = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
      const home = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
      await waitFor(() => expect(home.result.current.user).toEqual(USER));

      await act(async () => {
        await logEntry.result.current.upsertUser({ kv: { mood_logs: [] } });
      });

      await waitFor(() => expect(home.result.current.user).toEqual(saved));
    });

    // If the API ever answers 204/void, setQueryData never runs — every other
    // screen would keep the stale record unless we force a refetch.
    it('refetches when the save returns no body', async () => {
      const fresh = { user_id: 'u1', kv: { first_name: 'Refetched' } };
      mocked.fetchUserById
        .mockResolvedValueOnce(USER as never)
        .mockResolvedValue(fresh as never);
      mocked.updateUser.mockResolvedValue(undefined as never);

      const client = newClient();
      const { result } = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
      await waitFor(() => expect(result.current.user).toEqual(USER));

      await act(async () => {
        await result.current.upsertUser({ kv: { first_name: 'x' } });
      });

      await waitFor(() => expect(result.current.user).toEqual(fresh));
    });

    // Saving before the stored token had loaded used to fall through to
    // createUser, quietly making a second account.
    it('refuses to update when there is no signed-in user', async () => {
      const { result } = renderHook(() => useUser(undefined), {
        wrapper: wrapper(newClient()),
      });
      await expect(
        result.current.updateCurrentUser({ kv: { first_name: 'x' } })
      ).rejects.toMatchObject({ status: 409 });
      expect(mocked.createUser).not.toHaveBeenCalled();
    });
  });

  // Pull-to-refresh: the screen calls refetchUser and expects both a fresh
  // request and new data on screen.
  describe('refetchUser', () => {
    it('re-requests and surfaces the updated user', async () => {
      const updated = { user_id: 'u1', kv: { first_name: 'Updated' } };
      mocked.fetchUserById
        .mockResolvedValueOnce(USER as never)
        .mockResolvedValueOnce(updated as never);

      const { result } = renderHook(() => useUser('u1'), {
        wrapper: wrapper(newClient()),
      });
      await waitFor(() => expect(result.current.user).toEqual(USER));

      await act(async () => {
        await result.current.refetchUser(true);
      });

      expect(mocked.fetchUserById).toHaveBeenCalledTimes(2);
      await waitFor(() => expect(result.current.user).toEqual(updated));
    });

    // Screens list refetchUser in useFocusEffect deps; an unstable identity
    // made that effect re-run on every render.
    it('keeps a stable identity across renders', async () => {
      mocked.fetchUserById.mockResolvedValue(USER as never);
      const { result, rerender } = renderHook(() => useUser('u1'), {
        wrapper: wrapper(newClient()),
      });
      await waitFor(() => expect(result.current.user).toEqual(USER));

      const before = result.current.refetchUser;
      rerender();
      expect(result.current.refetchUser).toBe(before);
    });

    it('reports the refetch in flight so a pull-to-refresh spinner can show', async () => {
      mocked.fetchUserById.mockResolvedValueOnce(USER as never);
      const { result } = renderHook(() => useUser('u1'), {
        wrapper: wrapper(newClient()),
      });
      await waitFor(() => expect(result.current.user).toEqual(USER));

      // isInitialFetching is query.isLoading — false once data is cached, which
      // is exactly why binding RefreshControl to it showed no spinner.
      expect(result.current.isInitialFetching).toBe(false);

      // Hold the second request open so the in-flight state is observable.
      let release!: (u: unknown) => void;
      mocked.fetchUserById.mockReturnValueOnce(
        new Promise((resolve) => {
          release = resolve;
        }) as never
      );

      let pending!: Promise<unknown>;
      act(() => {
        pending = result.current.refetchUser(true);
      });

      await waitFor(() =>
        expect(result.current.isBackgroundFetching).toBe(true)
      );

      await act(async () => {
        release(USER);
        await pending;
      });
      await waitFor(() =>
        expect(result.current.isBackgroundFetching).toBe(false)
      );
    });
  });

  it('reports a fetch failure through error', async () => {
    mocked.fetchUserById.mockRejectedValue({ message: 'Offline' });
    const { result } = renderHook(() => useUser('u1'), {
      wrapper: wrapper(newClient()),
    });
    await waitFor(() => expect(result.current.error).toBe('Offline'));
  });

  // Logs are appended by the server now, so a save carries only what was just
  // entered. Sending the rebuilt history is what used to overwrite it, and what
  // capped it at the size of one database cell.
  describe('logging sends only the new entries', () => {
    it('does not resend history the client already holds', async () => {
      const existing = {
        user_id: 'u1',
        kv: {
          first_name: 'Amina',
          mood_logs: [
            { mood: 'calm', timestamp: '2026-09-20T07:00:00.000Z' },
            { mood: 'tired', timestamp: '2026-09-21T07:00:00.000Z' },
          ],
        },
      };
      mocked.fetchUserById.mockResolvedValue(existing as never);
      mocked.updateUser.mockResolvedValue(existing as never);

      const { result } = renderHook(() => useUser('u1'), {
        wrapper: wrapper(newClient()),
      });
      await waitFor(() => expect(result.current.user).toEqual(existing));

      const justLogged = [
        { mood: 'happy', timestamp: '2026-09-22T07:00:00.000Z' },
      ];
      await act(async () => {
        await result.current.updateCurrentUser({ kv: { mood_logs: justLogged } });
      });

      expect(mocked.updateUser).toHaveBeenCalledWith('u1', {
        kv: { mood_logs: justLogged },
      });
      const [, payload] = mocked.updateUser.mock.calls[0];
      expect(payload.kv?.mood_logs).toHaveLength(1);
    });

    it('caches the user the save returns', async () => {
      const afterSave = {
        user_id: 'u1',
        kv: {
          first_name: 'Amina',
          // kv carries the latest submission for each key — the history behind
          // it lives in s_user_log and is not part of this response.
          mood_logs: [
            { mood: 'happy', timestamp: '2026-09-22T07:00:00.000Z' },
          ],
        },
      };
      mocked.fetchUserById.mockResolvedValue(USER as never);
      mocked.updateUser.mockResolvedValue(afterSave as never);

      const client = newClient();
      const logEntry = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
      const home = renderHook(() => useUser('u1'), { wrapper: wrapper(client) });
      await waitFor(() => expect(home.result.current.user).toEqual(USER));

      await act(async () => {
        await logEntry.result.current.updateCurrentUser({
          kv: { mood_logs: [{ mood: 'happy', timestamp: '2026-09-22T07:00:00.000Z' }] },
        });
      });

      // Home must show the entry that was just logged, not the pre-save state.
      await waitFor(() =>
        expect(home.result.current.user?.kv?.mood_logs).toEqual([
          { mood: 'happy', timestamp: '2026-09-22T07:00:00.000Z' },
        ])
      );
    });
  });
});
