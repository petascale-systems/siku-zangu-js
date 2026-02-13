"use client"

import {useCallback, useEffect, useRef, useState} from 'react';
import {APIError, User} from '@siku-zangu/core';
import {AppState, AppStateStatus} from 'react-native';
import {
    USERS_API_PATH,
    USER_BY_ID_API_PATH,
    CHANGE_PIN_API_PATH,
    fetchUserById,
    createUser,
    updateUser,
    deleteUserById,
    changeUserPin,
} from './use-user.shared';
export {
    USERS_API_PATH,
    USER_BY_ID_API_PATH,
    CHANGE_PIN_API_PATH,
    createUser,
    updateUser,
    deleteUserById,
    changeUserPin,
};

export function useUser(userId?: string) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [isInitialFetching, setIsInitialFetching] = useState(true);
    const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
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
    useEffect(() => {
        if (!userId) return;
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                if (isFetchingRef.current) return;
                const now = Date.now();
                if (now - lastFetchRef.current > MIN_DELAY_BETWEEN_REFRESHES) {
                    refetchUser(true);
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [userId, refetchUser]);

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
        if (!userId) return;
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