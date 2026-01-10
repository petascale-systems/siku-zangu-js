"use client"

import {useCallback, useEffect, useRef, useState} from 'react';
import {APIError, User} from '@siku-zangu/core';
import {getJSON} from '../get-json.function';
import {postJSON} from '../post-json.function';
import {patchJSON} from '../patch-json.function';
import {deleteJSON} from '../delete-json.function';
import {useFocusEffect} from "expo-router";

export const USERS_API_PATH = '/api/users';
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`;
export const CHANGE_PIN_API_PATH = (id: string) => `/api/users/${id}/change-pin`;

async function fetchUserById(id: string): Promise<User> {
    return getJSON<User>(USER_BY_ID_API_PATH(id));
}

export async function createUser(user: User): Promise<User> {
    return postJSON<User, User>(USERS_API_PATH, user);
}

export async function updateUser(userId: string, user: User) {
    return patchJSON<User, User>(USER_BY_ID_API_PATH(userId), user);
}

export async function deleteUserById(userId: string): Promise<undefined | User> {
    return deleteJSON<User>(USER_BY_ID_API_PATH(userId));
}

export async function changeUserPin(
    userId: string,
    currentPin: string,
    newPin: string
): Promise<User | void> {
    return patchJSON<{ currentPin: string; newPin: string }, User>(
        CHANGE_PIN_API_PATH(userId),
        {currentPin, newPin}
    );
}

export function useUser(userId?: string) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [isInitialFetching, setIsInitialFetching] = useState(true); // Only for first load
    const [isBackgroundFetching, setIsBackgroundFetching] = useState(false); // Silent
    const [isUpsertingUser, setIsUpsertingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFetchingRef = useRef(false);
    const lastFetchRef = useRef<number>(0);
    const MIN_DELAY_BETWEEN_REFRESHES = 30000;

    const refetchUser = useCallback(async (isBackground = false) => {
        if (!userId || isFetchingRef.current) return;

        isFetchingRef.current = true;
        const setLoading = isBackground ? setIsBackgroundFetching : setIsInitialFetching;
        setLoading(true);
        setError(null);

        try {
            const fetchedUser = await fetchUserById(userId);
            setUser(fetchedUser);
            lastFetchRef.current = Date.now();
            return fetchedUser;
        } catch (e: any) {
            const errorMessage = (e as APIError).message || 'Failed to fetch user';
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [userId]);
    useEffect(() => {
        if (!userId) return;
        refetchUser(false);
    }, [userId, refetchUser]);
    useFocusEffect(
        useCallback(() => {
            if (!userId || isFetchingRef.current) return;
            const now = Date.now();
            if (now - lastFetchRef.current > MIN_DELAY_BETWEEN_REFRESHES) {
                refetchUser(true);
            }
        }, [userId, refetchUser])
    );

    async function upsertUser(userData: Partial<User>): Promise<User | void> {
        setIsUpsertingUser(true);
        setError(null);
        try {
            let upsertedUser: User | void;
            if (userId) {
                upsertedUser = await updateUser(userId, userData as User);
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

    async function changePin(currentPin: string, newPin: string): Promise<User | void> {
        if (!userId) {
            throw new Error('User ID is required to change PIN');
        }

        setIsChangingPin(true);
        setError(null);

        try {
            const updatedUser = await changeUserPin(userId, currentPin, newPin);
            if (updatedUser) {
                setUser(updatedUser);
            }
            return updatedUser;
        } catch (e: any) {
            const errorMessage = (e as APIError).message || 'Failed to change PIN';
            setError(errorMessage);
            throw e;
        } finally {
            setIsChangingPin(false);
        }
    }
    return {
        user,
        isFetchingUser: isInitialFetching || isBackgroundFetching,
        isInitialFetching,
        isBackgroundFetching,
        isUpsertingUser,
        isDeletingUser,
        isChangingPin,
        error,
        upsertUser,
        deleteUser,
        changePin,
        refetchUser: (b: boolean) => refetchUser(false),
    };
}