import { useEffect, useState } from 'react';
import { User, APIError } from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { patchJSON } from '../patch-json.function';
import { deleteJSON } from '../delete-json.function';

export const USERS_API_PATH = '/api/users';
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`;
export const AUTH_LOGIN_PATH = '/api/users/auth';

async function _fetchUserById(id: string) {
  return getJSON<User>(USER_BY_ID_API_PATH(id));
}

async function _createUser(user: User) {
  return postJSON<User, User>(USERS_API_PATH, user);
}

async function _updateUser(userId: string, user: User) {
  return patchJSON<User, User>(USER_BY_ID_API_PATH(userId), user);
}

async function _deleteUser(userId: string) {
  return deleteJSON<User>(USER_BY_ID_API_PATH(userId));
}

async function _loginUser(credentials: { phone_number: string; pin: string }) {
  return postJSON<{ phone_number: string; pin: string }, User>(
    AUTH_LOGIN_PATH,
    credentials
  );
}

export function useUser(userId?: string) {
  const [user, setUser] = useState<User>();
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [isUpsertingUser, setIsUpsertingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upsertUser(user: User) {
    setIsUpsertingUser(true);
    setError(null);
    try {
      const upsertedUser = await (userId
        ? _updateUser(userId, user)
        : _createUser(user));
      if (upsertedUser) setUser(upsertedUser);
      return upsertedUser;
    } catch (e: any) {
      const errorMessage =
        (e as APIError).issues?.map((issue: any) => issue.message).join(', ') ||
        (e as APIError).message ||
        'Failed to upsert user';
      setError(errorMessage);
      throw e;
    } finally {
      setIsUpsertingUser(false);
    }
  }

  async function loginUser(credentials: { phone_number: string; pin: string }) {
    setIsLoggingIn(true);
    setError(null);
    try {
      const loggedInUser = await _loginUser(credentials);
      if (loggedInUser) setUser(loggedInUser);
      return loggedInUser;
    } catch (e: any) {
      const errorMessage =
        (e as APIError).issues?.map((issue: any) => issue.message).join(', ') ||
        (e as APIError).message ||
        'Failed to login';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function deleteUser() {
    if (!userId) return;
    setIsDeletingUser(true);
    setError(null);
    try {
      await _deleteUser(userId);
      setUser(undefined);
    } catch (e: any) {
      const errorMessage = (e as APIError).message || 'Failed to delete user';
      setError(errorMessage);
      throw e;
    } finally {
      setIsDeletingUser(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    setIsFetchingUser(true);
    setError(null);
    _fetchUserById(userId)
      .then(setUser)
      .catch((e: any) => {
        const errorMessage = (e as APIError).message || 'Failed to fetch user';
        setError(errorMessage);
      })
      .finally(() => setIsFetchingUser(false));
  }, [userId]);

  return {
    user,
    isFetchingUser,
    isUpsertingUser,
    isDeletingUser,
    isLoggingIn,
    error,
    upsertUser,
    loginUser,
    deleteUser,
  };
}
