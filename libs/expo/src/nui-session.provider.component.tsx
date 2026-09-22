import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACCESS_TOKEN_KEY,
  setAuthToken,
  useAccessToken,
} from '@siku-zangu/react-native';
import { AccessToken, User } from '@siku-zangu/core';

type SessionContextValue = {
  /** The signed-in user's id, or undefined before sign-in. */
  userId?: string;
  user: User | null;
  /** False until the stored token has been read. */
  isSessionReady: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  error: string | null;
  loginUser: (credentials: {
    phone_number: string;
    pin: string;
  }) => Promise<AccessToken | void>;
  logoutUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  userId: undefined,
  user: null,
  isSessionReady: false,
  isLoggingIn: false,
  isLoggingOut: false,
  error: null,
  loginUser: async () => undefined,
  logoutUser: async () => undefined,
});

/**
 * Holds the signed-in user for the whole app.
 *
 * `userId` used to travel as a route param, re-passed by hand on every
 * navigation. The hand-rolled bottom bar did that on each tap, so it held
 * together; the native tab navigator switches tabs without params, so every
 * tab but the one you landed on saw `userId === undefined` and rendered as if
 * signed out. The same class of bug the `lang` param had.
 *
 * One store, read by every screen, so a sign-in is visible everywhere at once.
 */
function Provider({ children }: { children: React.ReactNode }) {
  const {
    user,
    loginUser: login,
    logoutUser: logout,
    isLoggingIn,
    isLoggingOut,
    error,
  } = useAccessToken();

  const [isSessionReady, setIsSessionReady] = useState(false);

  // The hook reads storage on mount; this only tracks when that has settled so
  // screens can tell "no session" from "not loaded yet".
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ACCESS_TOKEN_KEY)
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setIsSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loginUser = useCallback(
    async (credentials: { phone_number: string; pin: string }) =>
      (await login(credentials)) as AccessToken | void,
    [login]
  );

  const logoutUser = useCallback(async () => {
    await logout();
    // Belt and braces: the hook clears it too, but a stale bearer token
    // outliving the session is worth ruling out.
    setAuthToken(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      userId: user?.user_id,
      user: user ?? null,
      isSessionReady,
      isLoggingIn,
      isLoggingOut,
      error,
      loginUser,
      logoutUser,
    }),
    [user, isSessionReady, isLoggingIn, isLoggingOut, error, loginUser, logoutUser]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** The signed-in session. Prefer this over reading `userId` from route params. */
export const useSession = (): SessionContextValue => useContext(SessionContext);

export const NUISession = { Provider };
