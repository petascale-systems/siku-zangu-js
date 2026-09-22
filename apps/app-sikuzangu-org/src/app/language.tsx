import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Language,
  NUILanguagePicker,
  isOnboardingComplete,
  useLanguageContext,
  useToast
} from '@siku-zangu/expo';
import { useAccessToken } from '@siku-zangu/react-native';

const FLAGS = {
  en: require('../../assets/images/uk.png'),
  sw: require('../../assets/images/tz.png'),
};

/**
 * First-run language setup. Choosing here continues into onboarding or the
 * app; the Profile screen has its own route for changing it later, built on
 * the same picker.
 */
export default function LanguageScreen() {
  const { showError } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAccessToken();
  const { setLanguage } = useLanguageContext();
  const insets = useSafeAreaInsets();

  const userId = params.userId as string;

  const handleContinue = async (selectedLang: Language) => {
    try {
      // Publishes to the whole app, not just the screen we navigate to.
      await setLanguage(selectedLang);
      if (user && userId) {
        const hasCompletedOnboarding = await isOnboardingComplete(userId);
        router.replace({
          pathname: hasCompletedOnboarding
            ? '/tabs/home'
            : '/onboarding/updating-names',
          params: { lang: selectedLang, userId },
        });
      } else {
        router.push({
          pathname: '/auth/login',
          params: { lang: selectedLang },
        });
      }
    } catch {
      showError(selectedLang === 'en'
          ? 'Failed to save language preference'
          : 'Imeshindwa kuhifadhi lugha');
    }
  };

  // First-run setup has no header, so it clears the status bar and camera
  // cutout itself. The Profile copy of this screen is inside a Stack whose
  // header already does that, which is why the inset lives here and not in
  // the shared picker.
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <NUILanguagePicker flags={FLAGS} onConfirm={handleContinue} />
    </View>
  );
}
