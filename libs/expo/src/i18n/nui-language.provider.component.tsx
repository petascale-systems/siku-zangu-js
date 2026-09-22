import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '@siku-zangu/react-native';
import {
  i18n,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  Language,
  SUPPORTED_LANGUAGES,
  getDeviceLanguage,
  setI18nLanguage,
} from './translate.function';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  /** False until the stored preference has been read. */
  isLanguageReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: async () => undefined,
  isLanguageReady: false,
});

/**
 * Holds the active language for the whole app.
 *
 * Language used to travel as a `lang` route param, which meant switching it
 * only affected the screen you landed on: every screen already on the stack
 * kept the old value frozen in its own params, so going back showed the
 * previous language again. A single store fixes that — every screen reads the
 * same value and re-renders together.
 *
 * Resolution order for a signed-in user: their stored `kv.language` wins,
 * because the preference belongs to the account and should follow them to a
 * new device. Before sign-in (and as a cache) the choice lives in
 * AsyncStorage, and on first run we fall back to the device locale.
 *
 * Changing the language writes to both, so the account record stays correct.
 */
function Provider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string | null;
}) {
  const { user, updateCurrentUser } = useUser(userId || undefined);
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let next: Language = DEFAULT_LANGUAGE;
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        next = SUPPORTED_LANGUAGES.includes(stored as Language)
          ? (stored as Language)
          : getDeviceLanguage();
      } catch {
        // Unreadable storage shouldn't block the app; use the device locale.
        next = getDeviceLanguage();
      }

      if (cancelled) return;
      setI18nLanguage(next);
      setLanguageState(next);
      setIsLanguageReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A signed-in user's stored preference is authoritative, so it follows them
  // across devices. Only adopt it once it actually differs.
  const serverLanguage = user?.kv?.language as Language | undefined;
  useEffect(() => {
    if (!serverLanguage || !SUPPORTED_LANGUAGES.includes(serverLanguage)) return;
    setLanguageState((current) => {
      if (current === serverLanguage) return current;
      setI18nLanguage(serverLanguage);
      return serverLanguage;
    });
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, serverLanguage).catch(() => {
      // Cache only; the account record is already correct.
    });
  }, [serverLanguage]);

  const setLanguage = useCallback(
    async (next: Language) => {
      // Update in memory first so the UI switches immediately even if a write
      // fails; both persistence steps are best-effort.
      setI18nLanguage(next);
      setLanguageState(next);

      try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Preference is lost on restart, but the session still honours it.
      }

      if (!userId) return;
      try {
        await updateCurrentUser({ kv: { language: next } });
      } catch {
        // The device still shows the new language; the account record will
        // catch up the next time the user changes it.
      }
    },
    [userId, updateCurrentUser]
  );

  const value = useMemo(
    () => ({ language, setLanguage, isLanguageReady }),
    [language, setLanguage, isLanguageReady]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * The active language. Returns the same `'en' | 'sw'` union the existing
 * inline ternaries expect, so screens can adopt it a line at a time.
 */
export const useLanguage = (): Language => useContext(LanguageContext).language;

/** Full control: read, set, and know whether the stored value has loaded. */
export const useLanguageContext = (): LanguageContextValue =>
  useContext(LanguageContext);

/**
 * A `t` bound to the active language.
 *
 * Prefer this over importing `t` directly inside a component: it both reads the
 * current language and subscribes the component to changes, so a language
 * switch re-renders the copy. The bare `t` reads a module global and would not
 * re-render on its own.
 */
export const useTranslate = () => {
  const { language } = useLanguageContext();
  return useCallback(
    (key: string, options?: Record<string, unknown>) => {
      i18n.locale = language;
      return i18n.t(key, options);
    },
    [language]
  );
};

export const NUILanguage = { Provider };
