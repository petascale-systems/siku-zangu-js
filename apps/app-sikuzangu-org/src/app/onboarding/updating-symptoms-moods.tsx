import React, { useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {User} from '@siku-zangu/core';
import {
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  NUIButton
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function UpdatingSymptomsMoodsScreen() {
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

  const symptoms = [
    {
      key: 'cramps',
      label: t('updating_symptoms_moods.cramps'),
      icon: 'fitness',
    },
    {
      key: 'fatigue',
      label: t('updating_symptoms_moods.fatigue'),
      icon: 'battery-dead',
    },
    {
      key: 'bloating',
      label: t('updating_symptoms_moods.bloating'),
      icon: 'water',
    },
    {
      key: 'tender_breast',
      label: t('updating_symptoms_moods.tenderBreast'),
      icon: 'female',
    },
    {
      key: 'backache',
      label: t('updating_symptoms_moods.backache'),
      icon: 'body',
    },
    {
      key: 'headache',
      label: t('updating_symptoms_moods.headache'),
      icon: 'medkit',
    },
  ];

  const moods = [
    {
      key: 'happy',
      label: t('updating_symptoms_moods.happy'),
      icon: 'happy-outline',
    },
    {
      key: 'sad',
      label: t('updating_symptoms_moods.sad'),
      icon: 'sad-outline',
    },
    {
      key: 'tired',
      label: t('updating_symptoms_moods.tired'),
      icon: 'moon-outline',
    },
    {
      key: 'angry',
      label: t('updating_symptoms_moods.angry'),
      icon: 'alert-circle-outline',
    },
    {
      key: 'calm',
      label: t('updating_symptoms_moods.calm'),
      icon: 'leaf-outline',
    },
    {
      key: 'anxious',
      label: t('updating_symptoms_moods.anxious'),
      icon: 'alert-outline',
    },
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleSelection = (
    list: string[],
    setList: (v: string[]) => void,
    key: string
  ) => {
    if (list.includes(key)) {
      setList(list.filter((item) => item !== key));
    } else {
      setList([...list, key]);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      showError(t('updating_symptoms_moods.userIdNotAvailable'));
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const newSymptomLogs = selectedSymptoms.map((symptom) => ({
        symptom,
        timestamp,
      }));

      const newMoodLogs = selectedMoods.map((mood) => ({
        mood,
        timestamp,
      }));

      // The complete set selected, not an addition to anything stored. The
      // server appends it to the history and makes it the current selection.
      const updateData: User = {
        kv: {
          symptom_logs: newSymptomLogs,
          mood_logs: newMoodLogs,
        },
      };
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-medication',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (t('updating_symptoms_moods.failedToSaveSymptomsAnd'));
      showError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('updating_symptoms_moods.howDoYouFeelToday')}
            </Text>
            <Text style={styles.subtitle}>
              {t('updating_symptoms_moods.yourCycleCanImpactHow')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('updating_symptoms_moods.selectYourSymptoms')}
            </Text>
            <View style={styles.grid}>
              {symptoms.map((item) => {
                const isSelected = selectedSymptoms.includes(item.key);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() =>
                      toggleSelection(
                        selectedSymptoms,
                        setSelectedSymptoms,
                        item.key
                      )
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('updating_symptoms_moods.selectYourMoods')}
            </Text>
            <View style={styles.grid}>
              {moods.map((item) => {
                const isSelected = selectedMoods.includes(item.key);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() =>
                      toggleSelection(selectedMoods, setSelectedMoods, item.key)
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
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
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#645F5F"
              />
            </View>
            <Text style={styles.infoText}>
              {t('updating_symptoms_moods.youCanUpdateYourSymptoms')}
            </Text>
          </View>

          <NUIButton
            title={t('updating_symptoms_moods.next')}
            onPress={handleSave}
            loading={isUpsertingUser}
            trailingIcon="arrow-forward"
            accessibilityLabel={t('updating_symptoms_moods.next')}
            style={styles.nextButton}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.headingSm,
    fontStyle: 'normal',
    fontWeight: '600',
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
    marginBottom: 30,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: PAGE_BOTTOM_PADDING,
    paddingHorizontal:20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    backgroundColor: colors.surface.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: colors.brand.base,
    borderColor: colors.brand.base,
  },
  cardLabel: {
    ...typography.label,
    marginTop: 8,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.muted,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    ...typography.caption,
    flex: 1,
    fontStyle: 'normal',
    fontWeight: '400',
    color: colors.text.secondary,
  },
  nextButton: {
    // Layout only — fill, radius, padding and the disabled overlay come from
    // the primary tier in `controls`.
    marginTop: 30,
  },
});
