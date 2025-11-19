"use client"

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postJSON } from '../post-json.function';
import { AccessToken, APIError, User } from '@siku-zangu/core';

export const ACCESS_TOKEN_KEY = '@siku_zangu:access_token';
export const AUTH_LOGIN_PATH = '/api/users/auth';

async function _loginUser(credentials: { phone_number: string; pin: string }) {
  return postJSON<{ phone_number: string; pin: string }, AccessToken>(
    AUTH_LOGIN_PATH,
    credentials
  );
}

async function _logoutUser() {
  return AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggingIn(true);
    setError(null);
    loadToken()
      .then((accessToken) => {
        if (
          accessToken?.token &&
          accessToken.expires_in &&
          Date.now() < accessToken.expires_in * 1000
        ) {
          setToken(accessToken.token);
          if (accessToken.user) {
            setUser(accessToken.user);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      })
      .catch((e: any) => {
        const errorMessage =
          (e as APIError).message || 'Failed to load access token';
        setError(errorMessage);
      })
      .finally(() => setIsLoggingIn(false));
  }, []);

  async function loadToken() {
    const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (storedToken) {
      const accessToken: AccessToken = JSON.parse(storedToken);
      if (!accessToken.token || !accessToken.expires_in) {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        return null;
      }
      return accessToken;
    }
    return null;
  }

  async function loginUser(credentials: { phone_number: string; pin: string }) {
    setIsLoggingIn(true);
    setError(null);
    try {
      const accessToken = await _loginUser(credentials);
      if (accessToken?.token && accessToken.expires_in) {
        await AsyncStorage.setItem(
          ACCESS_TOKEN_KEY,
          JSON.stringify(accessToken)
        );
        setToken(accessToken.token);
        if (accessToken.user) {
          setUser(accessToken.user);
        }
        return accessToken;
      }
      throw {
        status: 400,
        message: 'Invalid response from server',
      } as APIError;
    } catch (e: any) {
      const errorMessage =
        (e as APIError).issues?.map((issue: any) => issue.message).join(', ') ||
        (e as APIError).message ||
        (e.status === 401
          ? 'Invalid phone number or PIN'
          : e.status === 400
            ? 'Invalid input format'
            : 'Failed to login');
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logoutUser() {
    setIsLoggingOut(true);
    setError(null);
    try {
      await _logoutUser();
      setToken(null);
      setUser(null);
    } catch (e: any) {
      const errorMessage = (e as APIError).message || 'Failed to logout';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoggingOut(false);
    }
  }

  return {
    token,
    user,
    isLoggingIn,
    isLoggingOut,
    error,
    loginUser,
    logoutUser,
  };
}