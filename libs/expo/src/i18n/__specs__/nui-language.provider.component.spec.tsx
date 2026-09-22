import React from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import {
  NUILanguage,
  useLanguage,
  useLanguageContext,
  useTranslate,
} from '../nui-language.provider.component';
import { LANGUAGE_STORAGE_KEY } from '../translate.function';

jest.mock('@siku-zangu/react-native', () => ({
  useUser: () => ({ user: undefined, upsertUser: jest.fn() }),
}));

const Probe = () => <Text testID="lang">{useLanguage()}</Text>;

describe('NUILanguageProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('defaults to the device locale when nothing is stored', async () => {
    render(
      <NUILanguage.Provider>
        <Probe />
      </NUILanguage.Provider>
    );
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'));
  });

  it('adopts a stored preference over the device locale', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'sw');
    render(
      <NUILanguage.Provider>
        <Probe />
      </NUILanguage.Provider>
    );
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('sw'));
  });

  it('ignores an unsupported stored value', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    render(
      <NUILanguage.Provider>
        <Probe />
      </NUILanguage.Provider>
    );
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'));
  });

  // The whole point of the store: every consumer switches together, which a
  // per-screen route param could not do.
  it('propagates a change to all consumers and persists it', async () => {
    let setLanguage!: (l: 'en' | 'sw') => Promise<void>;
    const Controller = () => {
      setLanguage = useLanguageContext().setLanguage;
      return null;
    };

    render(
      <NUILanguage.Provider>
        <Controller />
        <Probe />
        <Probe />
      </NUILanguage.Provider>
    );
    await waitFor(() => expect(screen.getAllByTestId('lang')[0]).toHaveTextContent('en'));

    await act(async () => {
      await setLanguage('sw');
    });

    screen.getAllByTestId('lang').forEach((node) =>
      expect(node).toHaveTextContent('sw')
    );
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('sw');
  });

  it('re-renders translated copy when the language changes', async () => {
    let setLanguage!: (l: 'en' | 'sw') => Promise<void>;
    const Translated = () => {
      const t = useTranslate();
      setLanguage = useLanguageContext().setLanguage;
      return <Text testID="copy">{t('common.save')}</Text>;
    };

    render(
      <NUILanguage.Provider>
        <Translated />
      </NUILanguage.Provider>
    );
    await waitFor(() => expect(screen.getByTestId('copy')).toHaveTextContent('Save'));

    await act(async () => {
      await setLanguage('sw');
    });
    expect(screen.getByTestId('copy')).toHaveTextContent('Hifadhi');
  });
});
