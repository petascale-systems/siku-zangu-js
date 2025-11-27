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
  const [userId, setUserId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en');

  const router = useRouter();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        setHasSeenLanguageScreen(!!savedLang);
        setLanguage(savedLang || 'en');
        const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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
      } finally {
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
      router.push('/LanguageScreen');
    } else if (!isLoggedIn) {
      router.push('/auth');
    } else if (!onboardingComplete && userId) {
      router.push({
        pathname: '/onboarding/UpdatingNamesScreen',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } else if (userId) {
      router.push({
        pathname: '/tabs/HomeScreen',
        params: {
          lang: language,
          userId: userId,
        },
      });
    }
  }, [
    isReady,
    hasSeenLanguageScreen,
    isLoggedIn,
    onboardingComplete,
    userId,
    language,
  ]);
  if (!isReady) {
    return (
      <ImageBackground
        source={require('../../assets/images/landingPage.png')}
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
