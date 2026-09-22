import { useRouter } from 'expo-router';
import {
  Language,
  NUILanguagePicker,
  useLanguageContext,
  useToast,
  useResetStackOnBlur
} from '@siku-zangu/expo';

const FLAGS = {
  en: require('../../../../assets/images/uk.png'),
  sw: require('../../../../assets/images/tz.png'),
};

/**
 * Changing the language from Profile.
 *
 * A separate route from the first-run `/language` screen, which continues into
 * onboarding or Home and so could never return you to Profile. The picker
 * itself is shared; only the confirm label and where it goes afterwards differ.
 */
export default function ProfileLanguageScreen() {
  // Leaving the Profile tab returns it to the Profile screen.
  useResetStackOnBlur();
  const { showError } = useToast();
  const router = useRouter();
  const { setLanguage } = useLanguageContext();

  const handleSave = async (selectedLang: Language) => {
    try {
      await setLanguage(selectedLang);
      router.back();
    } catch {
      showError(selectedLang === 'en'
          ? 'Failed to save language preference'
          : 'Imeshindwa kuhifadhi lugha');
    }
  };

  return (
    <NUILanguagePicker
      flags={FLAGS}
      renderTitle={(lang) =>
        lang === 'en' ? 'Choose your language' : 'Chagua lugha yako'
      }
      renderConfirmLabel={(lang) => (lang === 'en' ? 'Save' : 'Hifadhi')}
      onConfirm={handleSave}
    />
  );
}
