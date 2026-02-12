import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_TOKEN_KEY } from '@siku-zangu/react';

/**
 * Hook to protect routes that require authentication
 * @param requiredAuth - If true, user must be authenticated to access this route
 */
export function useAuthProtection(requiredAuth: boolean = true) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

                if (requiredAuth && !storedToken) {
                    // User should be logged in but isn't - redirect to login
                    const lang = await AsyncStorage.getItem('language');
                    router.replace({
                        pathname: '/auth/LoginScreen',
                        params: { lang: lang || 'en' }
                    });
                    return;
                }

                if (requiredAuth && storedToken) {
                    // Verify token is valid and not expired
                    try {
                        const parsed = JSON.parse(storedToken);
                        const isExpired = Date.now() >= parsed.expires_in * 1000;

                        if (isExpired || !parsed?.token || !parsed?.user?.user_id) {
                            // Token is invalid or expired
                            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                            const lang = await AsyncStorage.getItem('language');
                            router.replace({
                                pathname: '/auth/LoginScreen',
                                params: { lang: lang || 'en' }
                            });
                        }
                    } catch (parseError) {
                        // Token is corrupted
                        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                        const lang = await AsyncStorage.getItem('language');
                        router.replace({
                            pathname: '/auth/LoginScreen',
                            params: { lang: lang || 'en' }
                        });
                    }
                }
            } catch (error) {
                console.error('Auth protection error:', error);
            }
        };

        checkAuth();
    }, [requiredAuth, router]);
}