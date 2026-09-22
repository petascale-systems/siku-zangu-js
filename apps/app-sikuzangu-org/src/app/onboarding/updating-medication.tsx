import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {User} from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  colors,
  markOnboardingComplete,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  NUIButton
} from '@siku-zangu/expo';

export default function UpdatingMedicationScreen() {
  const { showError } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  const userId = params.userId as string;
  const { updateCurrentUser, isUpsertingUser, user } = useUser(userId);

  const medications = [
    {
      key: 'pain_relief',
      label: t('updating_medication.painRelief'),
      icon: 'medkit-outline'
},
    {
      key: 'herbal_supplement',
      label: t('updating_medication.herbalSupplement'),
      icon: 'leaf-outline',},
    {
      key: 'hormone_therapy',
      label: t('updating_medication.hormoneTherapy'),
      icon: 'flask-outline' },
    {
      key: 'birth_control',
      label: t('updating_medication.birthControl'),
      icon: 'pill-outline' },
  ];

  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelection = (key: string) => {
    if (selectedMedications.includes(key)) {
      setSelectedMedications(
        selectedMedications.filter((item) => item !== key)
      );
    } else {
      setSelectedMedications([...selectedMedications, key]);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      showError(t('updating_medication.userIdNotAvailable'));
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const newMedicationLogs = selectedMedications.map((medication) => ({
        medication,
        timestamp,
      }));

      // The complete set selected, not an addition to anything stored. The
      // server appends it to the history and makes it the current selection.
      const updateData: User = {
        kv: {
          medication_logs: newMedicationLogs,
        },
      };
      await updateCurrentUser(updateData);
      const onboardingMarked = await markOnboardingComplete(userId);
      if (onboardingMarked) {
        router.push({
          pathname: '/tabs/home',
          params: {
            lang: language,
            userId: userId,
          },
        });
      } else {
        router.push({
          pathname: '/tabs/home',
          params: {
            lang: language,
            userId: userId,
          },
        });
      }
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (t('updating_medication.failedToSaveMedications'));
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('updating_medication.whatMedicationAreYouTaking')}
          </Text>
          <Text style={styles.subtitle}>
            {t('updating_medication.loggingHelpsTrackEffectivenessAnd')}
          </Text>
        </View>
        <View style={styles.grid}>
          {medications.map((item) => {
            const isSelected = selectedMedications.includes(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleSelection(item.key)}
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={isSelected ? '#fff' : '#FD5A7E'}
                />
                <Text
                  style={[
                    styles.cardLabel,
                    isSelected && styles.cardLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <NUIButton
          title={t('updating_medication.confirm')}
          onPress={handleSave}
          loading={isUpsertingUser || isSaving}
          // No `disabled`. `handleSave` already reports a missing session;
          // a greyed Next with no explanation is a dead end for the user.
          accessibilityLabel={t('updating_medication.completeSetup')}
          style={styles.nextButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
    padding: 20,
  },
  content: {
    gap: 81,
  },
  title: {
    ...typography.headingSm,
    fontStyle: 'normal',
    fontWeight: '600',
    marginTop: 51,
    textAlign: 'center',
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface.card,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  cardSelected: {
    backgroundColor: colors.brand.base,
  },
  cardLabel: {
    ...typography.caption,
    marginTop: 8,
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  nextButton: {
    // Layout only — fill, radius, padding and the disabled overlay come from
    // the primary tier in `controls`.
    marginTop: 30,
  },
});
