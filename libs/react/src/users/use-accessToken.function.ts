import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postJSON } from '../post-json.function';
import { AccessToken, APIError } from '@siku-zangu/core';

// Constants
const ACCESS_TOKEN_KEY = '@siku_zangu:access_token';
const LOGIN_API_PATH = '/api/auth/login';


interface LoginCredentials {
  phone_number: string;
  pin: string;
}

// Hook
export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadToken = async () => {
      console.log('=== useAccessToken: loadToken STARTED ===');
      try {
        const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        console.log('useAccessToken: Stored token:', storedToken ? 'Found' : 'Not found');
        if (storedToken) {
          const accessToken: AccessToken = JSON.parse(storedToken);
          if (accessToken.token && accessToken.expires_in && Date.now() < accessToken.expires_in * 1000) {
            console.log('useAccessToken: Token valid, setting token:', accessToken.token);
            setToken(accessToken.token);
          } else {
            console.log('useAccessToken: Token expired or invalid, removing');
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
            setToken(null);
          }
        }
      } catch (e: any) {
        console.error('useAccessToken: Failed to load token:', e);
        setError('Failed to load access token');
      }
      console.log('=== useAccessToken: loadToken ENDED ===');
    };
    loadToken();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AccessToken | null> => {
    console.log('=== useAccessToken: login STARTED ===');
    console.log('useAccessToken: Login credentials:', { phone_number: credentials.phone_number, pin: '****' });

    setIsLoading(true);
    setError(null);
    try {
      const response = await postJSON<LoginCredentials, AccessToken>(LOGIN_API_PATH, credentials);
      console.log('useAccessToken: Login API response:', response);

      if (response.token && response.expires_in) {
        const accessToken: AccessToken = {
          token: response.token,
          expires_in: response.expires_in,
        };
        console.log('useAccessToken: Storing token:', accessToken.token);
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
        setToken(response.token);
        return accessToken;
      }
      console.log('useAccessToken: Invalid response, missing token or expires_in');
      throw { status: 400, message: 'Invalid response from server' } as APIError;
    } catch (e: any) {
      console.log('useAccessToken: Login failed, full error:', e);
      console.log('useAccessToken: Error details:', {
        status: e.status,
        message: e.message,
        issues: e.issues,
        name: e.name,
        stack: e.stack?.substring(0, 200),
      });
      const errorMessage =
        e.message?.includes('Non-JSON response') || e.name === 'SyntaxError'
          ? 'Cannot connect to the server. Please check your network or server configuration.'
          : e.status === 401
            ? 'Invalid phone number or PIN'
            : e.issues
              ? e.issues.map((issue: any) => issue.message).join(', ')
              : e.message || 'Login failed. Please try again.';
      console.log('useAccessToken: Constructed error message:', errorMessage);
      setError(errorMessage);
      throw { status: e.status || 500, message: errorMessage, issues: e.issues } as APIError;
    } finally {
      setIsLoading(false);
      console.log('=== useAccessToken: login ENDED ===');
    }
  };

  // Logout function
  const logout = async () => {
    console.log('=== useAccessToken: logout STARTED ===');
    setIsLoading(true);
    setError(null);
    try {
      console.log('useAccessToken: Clearing token from AsyncStorage');
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      setToken(null);
    } catch (e: any) {
      console.error('useAccessToken: Failed to logout:', e);
      setError('Failed to logout');
      throw { status: 500, message: 'Failed to logout' } as APIError;
    } finally {
      setIsLoading(false);
      console.log('=== useAccessToken: logout ENDED ===');
    }
  };

  return { token, isLoading, error, login, logout };
}