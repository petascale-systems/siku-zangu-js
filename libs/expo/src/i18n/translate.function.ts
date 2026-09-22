import { I18n } from 'i18n-js';
import { SCREEN_COPY } from './screen-copy';

export type Language = 'en' | 'sw';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'sw'];
export const DEFAULT_LANGUAGE: Language = 'en';
export const LANGUAGE_STORAGE_KEY = 'language';

/**
 * Translation catalog.
 *
 * Most copy still lives in inline `language === 'en' ? … : …` ternaries inside
 * the screens (~456 of them). Those keep working — `useLanguage()` feeds them
 * the same 'en' | 'sw' value they already expect. New strings belong here, and
 * existing ones can be lifted across screen by screen without a flag day.
 */
const translations = {
  en: {
    ...SCREEN_COPY.en,
    common: {
      save: 'Save',
      cancel: 'Cancel',
      next: 'Next',
      back: 'Back',
      retry: 'Retry',
      loading: 'Loading…',
      error: 'Error',
      success: 'Success',
      noChanges: 'Nothing new to save.',
    },
    tabs: {
      home: 'Home',
      calendar: 'Calendar',
      log: 'Log',
      insights: 'Insights',
      profile: 'Profile',
    },
    profile: {
      changeLanguage: 'Change Language',
      notifications: 'Notifications',
      changePin: 'Change PIN',
      updatePersonalInfo: 'Update Personal Info',
      deleteAccount: 'Delete Account',
    },
    log: {
      title: 'Your Log',
      editLog: 'Edit your log',
      addMood: 'Add your mood',
      addSymptoms: 'Add symptoms',
      recentSymptoms: 'Recent Symptoms',
      loggedToday: 'Logged today',
      loggedYesterday: 'Logged yesterday',
      loggedDaysAgo: 'Logged {{count}} days ago',
    },
  },
  sw: {
    ...SCREEN_COPY.sw,
    common: {
      save: 'Hifadhi',
      cancel: 'Ghairi',
      next: 'Ifuatayo',
      back: 'Rudi nyuma',
      retry: 'Jaribu tena',
      loading: 'Inapakia…',
      error: 'Hitilafu',
      success: 'Mafanikio',
      noChanges: 'Hakuna mabadiliko ya kuhifadhi.',
    },
    tabs: {
      home: 'Nyumbani',
      calendar: 'Kalenda',
      log: 'Rekodi',
      insights: 'Maarifa',
      profile: 'Wasifu',
    },
    profile: {
      changeLanguage: 'Badilisha Lugha',
      notifications: 'Arifa',
      changePin: 'Badilisha PIN',
      updatePersonalInfo: 'Sasisha Taarifa Binafsi',
      deleteAccount: 'Futa Akaunti',
    },
    log: {
      title: 'Rekodi Yako',
      editLog: 'Hariri rekodi yako',
      addMood: 'Ongeza hisia yako',
      addSymptoms: 'Ongeza dalili',
      recentSymptoms: 'Dalili za Hivi Karibuni',
      loggedToday: 'Imerekodiwa leo',
      loggedYesterday: 'Imerekodiwa jana',
      loggedDaysAgo: 'Imerekodiwa siku {{count}} zilizopita',
    },
  },
};

export const i18n = new I18n(translations);

i18n.defaultLocale = DEFAULT_LANGUAGE;
i18n.locale = DEFAULT_LANGUAGE;
// Fall back to English rather than rendering a missing-translation marker.
i18n.enableFallback = true;

export const setI18nLanguage = (language: Language) => {
  i18n.locale = language;
};

/** Translate a key, e.g. `t('log.addMood')`. */
export const t = (key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, options);

/**
 * The device's preferred language, when we support it. Used only as the
 * first-run default — an explicit choice always wins and is persisted.
 */
/**
 * The device's preferred language, when we support it. Used only as the
 * first-run default — an explicit choice always wins and is persisted.
 *
 * `expo-localization` is a native module, so it is required lazily and behind a
 * try/catch: a JS-only install, or a dev client built before the package was
 * added, throws "Cannot find native module 'ExpoLocalization'" on import. The
 * device locale is a nicety, so falling back to the default beats crashing on
 * launch.
 */
export const getDeviceLanguage = (): Language => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getLocales } = require('expo-localization');
    const codes: string[] = getLocales()
      .map((l: { languageCode?: string | null }) => l.languageCode)
      .filter((c: string | null | undefined): c is string => !!c);

    const match = codes.find((c) => SUPPORTED_LANGUAGES.includes(c as Language));
    return (match as Language) ?? DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};
