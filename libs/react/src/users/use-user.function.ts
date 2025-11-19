"use client"

import { useEffect, useState } from 'react';
import { User, UpdateUser, APIError } from '@siku-zangu/core';
import { getJSON } from '../get-json.function';
import { postJSON } from '../post-json.function';
import { patchJSON } from '../patch-json.function';
import { deleteJSON } from '../delete-json.function';

export const USERS_API_PATH = '/api/users';
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`;

async function fetchUserById(id: string): Promise<User> {
  return getJSON<User>(USER_BY_ID_API_PATH(id));
}

export async function createUser(user: User): Promise<User> {
  return postJSON<User, User>(USERS_API_PATH, user);
}

export async function updateUser(userId: string, user: UpdateUser) {
  return patchJSON<UpdateUser, User>(USER_BY_ID_API_PATH(userId), user);
}

export async function deleteUserById(userId: string): Promise<undefined | User> {
  return deleteJSON<User>(USER_BY_ID_API_PATH(userId));
}

export function useUser(userId?: string) {
  const [user, setUser] = useState<User>();
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [isUpsertingUser, setIsUpsertingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upsertUser(userData: User | UpdateUser): Promise<User | void> {
    setIsUpsertingUser(true);
    setError(null);
    try {
      let upsertedUser: User | void;

      if (userId) {
        upsertedUser = await updateUser(userId, userData);
      } else {
        upsertedUser = await createUser(userData as User);
      }

      if (upsertedUser) setUser(upsertedUser);
      return upsertedUser;
    } catch (e: any) {
      const errorMessage =
        (e as APIError).issues?.map((issue: any) => issue.error).join(', ') ||
        (e as APIError).message ||
        'Failed to upsert user';

      setError(errorMessage);
      throw e;
    } finally {
      setIsUpsertingUser(false);
    }
  }

  async function deleteUser(): Promise<void> {
    if (!userId) {
      return;
    }
    setIsDeletingUser(true);
    setError(null);
    try {
      await deleteUserById(userId);
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
    if (!userId) {
      return;
    }
    setIsFetchingUser(true);
    setError(null);

    fetchUserById(userId)
      .then((fetchedUser) => {
        setUser(fetchedUser);
      })
      .catch((e: any) => {
        const errorMessage = (e as APIError).message || 'Failed to fetch user';
        setError(errorMessage);
      })
      .finally(() => {
        setIsFetchingUser(false);
      });
  }, [userId]);

  return {
    user,
    isFetchingUser,
    isUpsertingUser,
    isDeletingUser,
    error,
    upsertUser,
    deleteUser,
  };
}