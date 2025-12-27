import {Stack, useRouter} from 'expo-router';
import {useCallback, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Animated, ImageBackground, StyleSheet} from 'react-native';
import {ACCESS_TOKEN_KEY} from '@siku-zangu/react';
import {useFirebaseCrashlytics, isOnboardingComplete} from '@siku-zangu/react-native';

const LANGUAGE_KEY = 'language';

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const crashlytics = useFirebaseCrashlytics(userId);
    const hasNavigated = useRef(false);

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
        const bootstrapApp = async () => {
            if (hasNavigated.current) return;

            try {
                const [savedLanguage, storedToken] = await Promise.all([
                    AsyncStorage.getItem(LANGUAGE_KEY),
                    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
                ]);

                const currentLanguage = savedLanguage || 'en';
                if (!savedLanguage) {
                    await AsyncStorage.setItem(LANGUAGE_KEY, currentLanguage);
                }
                if (!storedToken) {
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/LoginScreen',
                        params: { lang: currentLanguage },
                    });
                    return;
                }
                const parsed = JSON.parse(storedToken);
                if (!parsed?.token || !parsed?.expires_in || !parsed?.user?.user_id) {
                    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/LoginScreen',
                        params: { lang: currentLanguage },
                    });
                    return;
                }
                const isExpired = Date.now() >= parsed.expires_in * 1000;
                if (isExpired) {
                    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/LoginScreen',
                        params: { lang: currentLanguage },
                    });
                    return;
                }
                setUserId(parsed.user.user_id);
                const hasCompletedOnboarding = await isOnboardingComplete(parsed.user.user_id);

                hasNavigated.current = true;
                if (!hasCompletedOnboarding) {
                    router.replace({
                        pathname: '/onboarding/UpdatingNamesScreen',
                        params: {
                            lang: currentLanguage,
                            userId: parsed.user.user_id,
                        },
                    });
                } else {
                    router.replace({
                        pathname: '/tabs/HomeScreen',
                        params: {
                            lang: currentLanguage,
                            userId: parsed.user.user_id,
                        },
                    });
                }

            } catch (error) {
                if (error instanceof Error) {
                    crashlytics.logError(error, 'Bootstrap failed');
                }
                await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
                hasNavigated.current = true;
                router.replace({
                    pathname: '/auth/LoginScreen',
                    params: { lang: lang || 'en' },
                });
            } finally {
                setTimeout(() => {
                    setAppIsReady(true);
                }, 500);
            }
        };

        bootstrapApp();
    }, []);

    return (
        <>
            <Stack
                screenOptions={{headerShown: false}}
                onLayout={onLayoutRootView}
            >
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="LanguageScreen"/>
                <Stack.Screen name="auth"/>
                <Stack.Screen name="onboarding"/>
                <Stack.Screen name="tabs"/>
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