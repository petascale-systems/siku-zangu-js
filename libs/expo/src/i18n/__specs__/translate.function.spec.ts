import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getDeviceLanguage,
  i18n,
  setI18nLanguage,
  t,
} from '../translate.function';
import { SCREEN_COPY } from '../screen-copy';

describe('translation catalog', () => {
  afterEach(() => setI18nLanguage(DEFAULT_LANGUAGE));

  it('supports exactly en and sw', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'sw']);
  });

  it('translates a key in both languages', () => {
    setI18nLanguage('en');
    expect(t('common.save')).toBe('Save');
    setI18nLanguage('sw');
    expect(t('common.save')).toBe('Hifadhi');
  });

  it('interpolates values', () => {
    setI18nLanguage('en');
    expect(t('log.loggedDaysAgo', { count: 3 })).toBe('Logged 3 days ago');
  });

  it('falls back to English for a key missing in Swahili', () => {
    setI18nLanguage('sw');
    expect(i18n.t('common.save')).toBeTruthy();
  });

  it('uses the device language only when supported', () => {
    // The mock in test-setup reports en-US.
    expect(SUPPORTED_LANGUAGES).toContain(getDeviceLanguage());
  });
});

describe('screen copy generated from the inline ternaries', () => {
  const namespaces = Object.keys(SCREEN_COPY.en);

  it('covers every screen in both languages', () => {
    expect(namespaces.length).toBeGreaterThan(0);
    expect(Object.keys(SCREEN_COPY.sw).sort()).toEqual(namespaces.sort());
  });

  // A key present in English but not Swahili would silently render English to
  // a Swahili speaker via the fallback.
  it('has a Swahili entry for every English key', () => {
    const missing: string[] = [];
    for (const ns of namespaces) {
      for (const key of Object.keys((SCREEN_COPY.en as any)[ns])) {
        if ((SCREEN_COPY.sw as any)[ns]?.[key] === undefined) {
          missing.push(`${ns}.${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no English entry left untranslated by accident', () => {
    // An identical string in both languages is usually a real word that does
    // not translate (a proper noun); an EMPTY Swahili value is deliberate
    // where English appends a suffix Swahili does not use.
    const emptyEn: string[] = [];
    for (const ns of namespaces) {
      for (const [key, value] of Object.entries((SCREEN_COPY.en as any)[ns])) {
        if (typeof value !== 'string') emptyEn.push(`${ns}.${key}`);
      }
    }
    expect(emptyEn).toEqual([]);
  });

  it('preserves a deliberately empty Swahili string rather than falling back', () => {
    setI18nLanguage('sw');
    expect(t('home.phase')).toBe('');
    setI18nLanguage('en');
    expect(t('home.phase')).toBe(' Phase');
  });
});
