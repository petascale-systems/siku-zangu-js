import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { ACCESS_TOKEN_KEY } from '@siku-zangu/react';
import { isOnboardingComplete } from '@siku-zangu/react-native';
import { useRouter } from 'expo-router';

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [hasSeenLanguageScreen, setHasSeenLanguageScreen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('language');
                setHasSeenLanguageScreen(!!savedLang);

                const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
                if (storedToken) {
                    const parsed = JSON.parse(storedToken);
                    if (parsed?.token && parsed?.expires_in) {
                        const isExpired = Date.now() >= parsed.expires_in * 1000;
                        if (!isExpired && parsed.user?.user_id) {
                            setIsLoggedIn(true);
                            const completed = await isOnboardingComplete(parsed.user.user_id);
                            setOnboardingComplete(completed);
                        } else {
                            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                        }
                    }
                }
            } catch (e) {
                console.error('Bootstrap failed:', e);
            } finally {
                // Small delay to show splash
                setTimeout(() => {
                    setIsReady(true);
                }, 1500);
            }
        };

        bootstrapAsync();
    }, []);

    useEffect(() => {
        if (!isReady) return;

        if (!hasSeenLanguageScreen) {
            router.replace('/LanguageScreen');
        } else if (!isLoggedIn) {
            router.replace('/auth');
        } else if (!onboardingComplete) {
            router.replace('/onboarding');
        } else {
            router.replace('/tabs/HomeScreen');
        }
    }, [isReady, hasSeenLanguageScreen, isLoggedIn, onboardingComplete]);

    if (!isReady) {
        return (
            <ImageBackground
                source={require('../../assets/images/landingPage.png')} // Fixed typo: .pngg -> .png
                resizeMode="cover"
                style={styles.container}
            />
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="LanguageScreen" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="tabs" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});