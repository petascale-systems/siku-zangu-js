import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCard, PrimaryButton, isOnboardingComplete } from '@siku-zangu/expo';
import { useAccessToken } from '@siku-zangu/react-native';

export default function LanguageScreen() {
  const [selectedLang, setSelectedLang] = useState<'en' | 'sw'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAccessToken();

  const currentLang = (params.lang as 'en' | 'sw') || 'en';
  const userId = params.userId as string;
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang === 'en' || savedLang === 'sw') {
          setSelectedLang(savedLang);
        } else if (currentLang) {
          setSelectedLang(currentLang);
        }
      } catch (error) {
      }
    };
    loadLanguage();
  }, [currentLang]);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('language', selectedLang);
      if (user && userId) {
        const hasCompletedOnboarding = await isOnboardingComplete(userId);
        if (!hasCompletedOnboarding) {
          router.replace({
            pathname: '/onboarding/UpdatingNamesScreen',
            params: { lang: selectedLang, userId },
          });
        } else {
          router.replace({
            pathname: '/tabs/HomeScreen',
            params: { lang: selectedLang, userId },
          });
        }
      } else {
        router.push({
          pathname: '/auth/LoginScreen',
          params: { lang: selectedLang },
        });
      }
    } catch (error) {
      Alert.alert(
          selectedLang === 'en' ? 'Error' : 'Hitilafu',
          selectedLang === 'en'
              ? 'Failed to save language preference'
              : 'Imeshindwa kuhifadhi lugha'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {selectedLang === 'en'
              ? 'Your Cycle. Your Health. Your Language'
              : 'Mzunguko Wako. Afya Yako. Lugha Yako'}
        </Text>
        <LanguageCard
            flag={require('../../assets/images/uk.png')}
            title="English"
            subtitle="Welcome"
            selected={selectedLang === 'en'}
            onPress={() => setSelectedLang('en')}
        />
        <LanguageCard
            flag={require('../../assets/images/tz.png')}
            title="Kiswahili"
            subtitle="Karibu"
            selected={selectedLang === 'sw'}
            onPress={() => setSelectedLang('sw')}
        />
        <PrimaryButton
            title={
              selectedLang === 'en'
                  ? 'Continue in English'
                  : 'Endelea Kwa Kiswahili'
            }
            onPress={handleContinue}
            disabled={isLoading}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontSize: 22,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 30,
    color: '#FD5A7E',
    width: 272,
    height: 66,
  },
});