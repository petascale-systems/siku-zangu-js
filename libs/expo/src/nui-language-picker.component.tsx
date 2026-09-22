import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { NUILanguageCard } from './nui-language-card.component';
import { NUIPrimaryButton } from './nui-primary-button.component';
import { colors, spacing } from './theme';
import { typography } from './typography';
import { Language } from './i18n/translate.function';
import { useLanguageContext } from './i18n/nui-language.provider.component';

type Props = {
  /**
   * Flag artwork. Passed in rather than required here so the component stays
   * independent of any one app's asset folder.
   */
  flags: { en: ImageSourcePropType; sw: ImageSourcePropType };
  /** Both are given the previewed language, not the active one. */
  renderTitle?: (lang: Language) => string;
  renderConfirmLabel?: (lang: Language) => string;
  onConfirm: (lang: Language) => void | Promise<void>;
};

const defaultTitle = (lang: Language) =>
  lang === 'en'
    ? 'Your Cycle. Your Health. Your Language'
    : 'Mzunguko Wako. Afya Yako. Lugha Yako';

const defaultConfirmLabel = (lang: Language) =>
  lang === 'en' ? 'Continue in English' : 'Endelea Kwa Kiswahili';

/**
 * Language chooser, shared by first-run setup and the Profile screen.
 *
 * The two differ only in what happens on confirm and what the button says, so
 * everything else — seeding the selection, the cards, the layout — lives here
 * rather than being copied into a second screen.
 *
 * Copy reacts to the *previewed* language rather than the active one, so the
 * screen shows what you are about to switch to before you commit to it.
 */
export const NUILanguagePicker: React.FC<Props> = ({
  flags,
  renderTitle = defaultTitle,
  renderConfirmLabel = defaultConfirmLabel,
  onConfirm,
}) => {
  const { language: currentLang } = useLanguageContext();
  const [selectedLang, setSelectedLang] = useState<Language>(currentLang);
  const [isBusy, setIsBusy] = useState(false);

  // The provider resolves the stored/device preference asynchronously; mirror
  // it so the cards open on the language actually in use.
  useEffect(() => {
    setSelectedLang(currentLang);
  }, [currentLang]);

  const handleConfirm = async () => {
    setIsBusy(true);
    try {
      await onConfirm(selectedLang);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{renderTitle(selectedLang)}</Text>
        <NUILanguageCard
          flag={flags.en}
          title="English"
          subtitle="Welcome"
          selected={selectedLang === 'en'}
          onPress={() => setSelectedLang('en')}
        />
        <NUILanguageCard
          flag={flags.sw}
          title="Kiswahili"
          subtitle="Karibu"
          selected={selectedLang === 'sw'}
          onPress={() => setSelectedLang('sw')}
        />
        <View style={styles.actions}>
          <NUIPrimaryButton
            title={renderConfirmLabel(selectedLang)}
            onPress={handleConfirm}
            loading={isBusy}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    // Was 32 here on top of the title's own 30pt margin and each card's
    // vertical margin, so the four elements drifted 40-60pt apart and read as
    // four unrelated screens' worth of content.
    gap: spacing.sm + 4,
  },
  // The group is centred as a block and capped, so the cards do not run the
  // full width of a large screen while the title sits centred above them.
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  title: {
    ...typography.titleSm,
    textAlign: 'center',
    fontWeight: '700',
    // Was lineHeight 24 on a 22pt face (1.09x) inside a hard-pinned
    // 272x66 box, so the third line was cut off before any font scaling.
    marginBottom: spacing.xs,
    color: colors.text.primary,
    maxWidth: 320,
    alignSelf: 'center',
  },
});
