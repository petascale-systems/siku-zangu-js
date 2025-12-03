import { Stack } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground, StyleSheet, Animated } from 'react-native';
import { ACCESS_TOKEN_KEY } from '@siku-zangu/react';
import { isOnboardingComplete } from '@siku-zangu/react-native';
import { useRouter } from 'expo-router';

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [hasSeenLanguageScreen, setHasSeenLanguageScreen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [language, setLanguage] = useState<string>('en');
    const [appIsReady, setAppIsReady] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const hasNavigated = useRef(false);
    const router = useRouter();
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [appIsReady, fadeAnim]);
    useEffect(() => {
        const bootstrapAsync = async () => {
            const startTime = Date.now();

            try {
                const [savedLang, storedToken] = await Promise.all([
                    AsyncStorage.getItem('language'),
                    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
                ]);

                setHasSeenLanguageScreen(!!savedLang);
                setLanguage(savedLang || 'en');
                if (storedToken) {
                    const parsed = JSON.parse(storedToken);
                    if (parsed?.token && parsed?.expires_in) {
                        const isExpired = Date.now() >= parsed.expires_in * 1000;
                        if (!isExpired && parsed.user?.user_id) {
                            setIsLoggedIn(true);
                            setUserId(parsed.user.user_id);
                            const completed = await isOnboardingComplete(parsed.user.user_id);
                            setOnboardingComplete(completed);
                        } else {
                            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                        }
                    }
                }
            } catch (e) {
                console.error('Bootstrap error:', e);
            } finally {
                const loadTime = Date.now() - startTime;
                const minDisplayTime = 500;
                if (loadTime < minDisplayTime) {
                    setTimeout(() => {
                        setIsReady(true);
                    }, minDisplayTime - loadTime);
                } else {
                    setIsReady(true);
                }
            }
        };
        bootstrapAsync();
    }, []);
    useEffect(() => {
        if (!isReady || hasNavigated.current) return;
        hasNavigated.current = true;
        if (!hasSeenLanguageScreen) {
            router.replace('/LanguageScreen');
        } else if (!isLoggedIn) {
            router.replace('/auth');
        } else if (!onboardingComplete && userId) {
            router.replace({
                pathname: '/onboarding/UpdatingNamesScreen',
                params: { lang: language, userId: userId },
            });
        } else if (userId) {
            router.replace({
                pathname: '/tabs/HomeScreen',
                params: { lang: language, userId: userId },
            });
        }
        setTimeout(() => {
            setAppIsReady(true);
        }, 400);
    }, [isReady, hasSeenLanguageScreen, isLoggedIn, onboardingComplete, userId, language, router]);
    return (
        <>
            <Stack
                screenOptions={{ headerShown: false }}
                onLayout={onLayoutRootView}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="LanguageScreen" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="tabs" />
            </Stack>
            {!appIsReady && (
                <Animated.View
                    style={[
                        styles.splashContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <ImageBackground
                        source={require('../../assets/images/landingPage.png')}
                        resizeMode="cover"
                        style={styles.container}
                    />
                </Animated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF4EC',
    },
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
});