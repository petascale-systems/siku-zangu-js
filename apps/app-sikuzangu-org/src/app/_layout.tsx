import {Stack, useRouter} from 'expo-router';
import {useCallback, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Animated, ImageBackground, StyleSheet, View} from 'react-native';
import {
    SafeAreaProvider,
    initialWindowMetrics,
} from 'react-native-safe-area-context';

import {ACCESS_TOKEN_KEY, XUIQuery, setAuthToken, useAppStateFocus} from '@siku-zangu/react-native';
import {
  NUILanguage,
  NUISession,
  NUIToast,
  colors,
  isOnboardingComplete,
  typography,
  useFirebaseCrashlytics,
  useNotifications,
} from '@siku-zangu/expo';
import '../firebase.config';

/**
 * `initialWindowMetrics` is null until the native module has reported — on a
 * cold start, after a fast refresh, and on some Android launches. The provider
 * then leaves its context null for a frame, and any child reading insets in
 * that frame throws "No safe area value available", which looks exactly like a
 * missing provider. Zeros are corrected on the first layout pass.
 */
const SAFE_AREA_FALLBACK = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Long enough that the splash reads as intentional rather than a flicker. */
const MIN_SPLASH_MS = 600;

const LANGUAGE_KEY = 'language';
const FIRST_LAUNCH_KEY = 'hasLaunchedBefore';

export default function RootLayout() {
    // Feeds AppState into Query's focus manager; focusManager is global, so
    // this works from the root regardless of provider nesting.
    useAppStateFocus();

    const [appIsReady, setAppIsReady] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [language, setLanguage] = useState<string>('en');
    const hasNavigated = useRef(false);
    const crashlytics = useFirebaseCrashlytics(userId);
    const {expoPushToken, notification, notificationResponse} = useNotifications(userId || undefined);

    useEffect(() => {
        if (expoPushToken && userId) {
            // console.log('Push token registered for user:', userId);
            // console.log('Token:', expoPushToken);
        }
    }, [expoPushToken, userId]);
    const navigateByNotificationType = useCallback((type: string, data?: Record<string, any>) => {
        if (type === 'medication_reminder') {
            router.push({
                pathname: '/tabs/log-entry',
                params: {lang: language, userId: userId!},
            });
        } else if (type === 'new_article') {
            router.push({
                pathname: '/article-detail',
                params: {lang: language, userId: userId!, articleId: data?.articleId || ''},
            });
        } else {
            router.push({
                pathname: '/tabs/home',
                params: {lang: language, userId: userId!},
            });
        }
    }, [language, userId, router]);

    // Handle foreground notifications
    useEffect(() => {
        if (notification && userId && appIsReady) {
            console.log('Notification received:', notification);
        }
    }, [notification, userId, appIsReady]);

    // Handle notification taps (background + killed state)
    useEffect(() => {
        if (notificationResponse && userId && appIsReady) {
            const data = notificationResponse.notification.request.content.data;
            if (data.type) {
                navigateByNotificationType(data.type as string, data);
            }
        }
    }, [notificationResponse, userId, appIsReady, navigateByNotificationType]);

    useEffect(() => {
        if (!appIsReady) return;
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [appIsReady, fadeAnim]);

    useEffect(() => {
        let readyTimer: ReturnType<typeof setTimeout> | undefined;

        const startedAt = Date.now();

        const bootstrapApp = async () => {
            if (hasNavigated.current) return;

            try {
                const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

                if (!hasLaunched) {
                    await AsyncStorage.clear();
                    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');

                    hasNavigated.current = true;
                    router.replace('/language');
                    return;
                }

                const [savedLanguage, storedToken] = await Promise.all([
                    AsyncStorage.getItem(LANGUAGE_KEY),
                    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
                ]);

                const currentLanguage = savedLanguage || 'en';
                setLanguage(currentLanguage);

                if (!savedLanguage) {
                    await AsyncStorage.setItem(LANGUAGE_KEY, currentLanguage);
                }

                if (!storedToken) {
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/login',
                        params: {lang: currentLanguage},
                    });
                    return;
                }

                const parsed = JSON.parse(storedToken);
                if (!parsed?.token || !parsed?.expires_in || !parsed?.user?.user_id) {
                    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                setAuthToken(null);
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/login',
                        params: {lang: currentLanguage},
                    });
                    return;
                }

                const isExpired = Date.now() >= parsed.expires_in * 1000;
                if (isExpired) {
                    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                setAuthToken(null);
                    hasNavigated.current = true;
                    router.replace({
                        pathname: '/auth/login',
                        params: {lang: currentLanguage},
                    });
                    return;
                }

                // Bootstrap runs before any hook mounts, so publish the token
                // here or the first requests of the session go out unauthenticated.
                setAuthToken(parsed.token);
                setUserId(parsed.user.user_id);

                const hasCompletedOnboarding = await isOnboardingComplete(parsed.user.user_id);

                hasNavigated.current = true;
                if (!hasCompletedOnboarding) {
                    router.replace({
                        pathname: '/onboarding/updating-names',
                        params: {
                            lang: currentLanguage,
                            userId: parsed.user.user_id,
                        },
                    });
                } else {
                    router.replace({
                        pathname: '/tabs/home',
                        params: {
                            lang: currentLanguage,
                            userId: parsed.user.user_id,
                        },
                    });
                }

            } catch (error) {
                console.error('❌ Bootstrap error:', error);
                if (error instanceof Error) {
                    crashlytics.logError(error, 'Bootstrap failed');
                }

                await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
                setAuthToken(null);
                const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
                hasNavigated.current = true;
                router.replace({
                    pathname: '/auth/login',
                    params: {lang: lang || 'en'},
                });
            } finally {
                // Was a flat 3s regardless of how long bootstrap actually took,
                // so a fast start still sat on the splash and then handed over
                // to the screen's own spinner — two waits back to back. Reveal
                // as soon as the work is done, with a floor only long enough
                // that the splash does not flash.
                const elapsed = Date.now() - startedAt;
                readyTimer = setTimeout(
                    () => setAppIsReady(true),
                    Math.max(0, MIN_SPLASH_MS - elapsed)
                );
            }
        };

        bootstrapApp();
        return () => {
            if (readyTimer) clearTimeout(readyTimer);
        };
    }, []);

    return (
        // 21 screens call useSafeAreaInsets(), but nothing ever rendered the
        // provider they need — hence "No safe area value available". It has to
        // be the outermost wrapper. initialMetrics supplies the insets
        // synchronously on the first render, so the context is never null and
        // nothing jumps once the real values arrive.
        <SafeAreaProvider initialMetrics={initialWindowMetrics ?? SAFE_AREA_FALLBACK}>
        {/* One Query cache for every screen's useUser(). RootLayout itself
            does not call useUser, so wrapping here is enough. */}
        <XUIQuery.Provider>
        <NUISession.Provider>
        <NUILanguage.Provider userId={userId}>
        <NUIToast.Provider>
        <View style={{flex: 1}}>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="language"/>
                <Stack.Screen name="auth"/>
                <Stack.Screen name="onboarding"/>
                <Stack.Screen name="tabs"/>
                {/* Pushed over the tabs: linked from both Home and Insights,
                    so it cannot live inside either tab's own stack. The profile
                    settings screens used to be declared here too, but they now
                    sit under `tabs/user-profile/` and are declared by that
                    layout — leaving them here made expo-router report four
                    extraneous routes.

                    The header is configured HERE rather than in the screen.
                    The screen used to turn it on itself, with a
                    `<Stack.Screen options={{headerShown: true}}/>` rendered
                    only once the article had loaded — so the route's own
                    config stayed `headerShown: false`, and until then nothing
                    reserved space for the status bar or the camera cutout.
                    An article with a cover image hid that, because a
                    full-bleed image under the cutout reads as deliberate; an
                    article without one put its title behind the camera. The
                    screen still sets `title`, which is the only part that
                    depends on the article. */}
                <Stack.Screen
                    name="article-detail"
                    options={{
                        headerShown: true,
                        // Chevron only, no label.
                        headerBackButtonDisplayMode: 'minimal' as const,
                        headerTintColor: colors.brand.text,
                        headerStyle: {backgroundColor: colors.surface.card},
                        headerTitleStyle: {
                            ...typography.headingSm,
                            color: colors.text.primary,
                        },
                        headerTitleAlign: 'center',
                    }}
                />
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
        </View>
        </NUIToast.Provider>
        </NUILanguage.Provider>
        </NUISession.Provider>
        </XUIQuery.Provider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface.app,
    },
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
});