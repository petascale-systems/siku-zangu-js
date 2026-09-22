import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {
  CYCLE_LENGTH_OPTIONS,
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  NUIButton
} from '@siku-zangu/expo';
import {User} from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UpdatingCycleLengthScreen() {
  const { showError } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  const userId = params.userId as string;
  const { updateCurrentUser, isUpsertingUser } = useUser(userId);

  const [selectedLength, setSelectedLength] = useState<number>(28);
  const cycleLengths = CYCLE_LENGTH_OPTIONS;

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

  const handleSave = async () => {
    if (!userId) {
      showError(t('updating_cycle_length.userIdNotAvailable'));
      return;
    }

    try {
      const updateData: User = {
        kv: {
          avg_cycle_length_days: selectedLength,
        },
      };
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-symptoms-moods',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (t('updating_cycle_length.failedToSaveCycleLength'));
      showError(errorMessage);
    }
  };

  const getFertileWindow = (length: number) => {
    const ovulationDay = length - 14;
    const fertileStart = Math.max(1, ovulationDay - 2);
    const fertileEnd = ovulationDay + 2;
    return { fertileStart, fertileEnd };
  };

  const renderCycleIndicator = (length: number) => {
    const isSelected = selectedLength === length;
    const { fertileStart, fertileEnd } = getFertileWindow(length);

    const dots = Array.from({ length }, (_, i) => {
      const day = i + 1;
      const isFertile = day >= fertileStart && day <= fertileEnd;
      return (
        <View
          key={i}
          style={[
            styles.cycleDot,
            isFertile && styles.cycleDotFertile,
            isSelected && isFertile && styles.cycleDotFertileSelected,
          ]}
        />
      );
    });

    return <View style={styles.cycleIndicator}>{dots}</View>;
  };

  return (
    <View style={styles.container}>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === 'en'
              ? "What's your average cycle length?"
              : 'Mzunguko wako una siku ngapi kwa wastani?'}
          </Text>

          <Text style={styles.subtitle}>
            {t('updating_cycle_length.aCycleStartsOnDay')}
          </Text>
        </View>

        <View style={styles.visualIndicator}>
          <View style={styles.cycleInfoContainer}>
            <Ionicons name="calendar-outline" size={20} color="#FD5A7E" />
            <Text style={styles.cycleInfoText}>
              {t('updating_cycle_length.fertileWindow')}
            </Text>
          </View>
        </View>

        <View style={styles.lengthContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {cycleLengths.map((length) => {
              const { fertileStart, fertileEnd } = getFertileWindow(length);
              return (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.lengthCard,
                    selectedLength === length && styles.lengthCardSelected,
                  ]}
                  onPress={() => setSelectedLength(length)}
                  accessibilityLabel={`${length} ${
                    t('updating_cycle_length.days')
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedLength === length }}
                >
                  {renderCycleIndicator(length)}

                  <View style={styles.lengthContent}>
                    <Text
                      style={[
                        styles.lengthNumber,
                        selectedLength === length &&
                          styles.lengthNumberSelected,
                      ]}
                    >
                      {length}
                    </Text>
                    <Text
                      style={[
                        styles.lengthLabel,
                        selectedLength === length && styles.lengthLabelSelected,
                      ]}
                    >
                      {t('updating_cycle_length.days2')}
                    </Text>
                  </View>

                  <Text style={styles.fertileWindowText}>
                    {t('updating_cycle_length.day')} {fertileStart}-
                    {fertileEnd}
                  </Text>

                  {selectedLength === length && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FD5A7E"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
            {t('updating_cycle_length.youCanChangeYourAnswer')}
          </Text>
        </View>

        <NUIButton
          title={t('updating_cycle_length.next')}
          onPress={handleSave}
          loading={isUpsertingUser}
          trailingIcon="arrow-forward"
          accessibilityLabel={t('updating_cycle_length.next')}
          style={styles.nextButton}
        />
      </Animated.View>
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
    flex: 1,
  },
  title: {
    ...typography.headingSm,
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 51,
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
  visualIndicator: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cycleInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cycleInfoText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text.secondary,
    marginLeft: 6,
  },
  lengthContainer: {
    marginBottom: 30,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  lengthCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lengthCardSelected: {
    backgroundColor: colors.surface.app,
    borderColor: colors.brand.base,
  },
  cycleIndicator: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 15,
    maxWidth: 80,
    justifyContent: 'center',
  },
  cycleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    margin: 1,
  },
  cycleDotFertile: {
    backgroundColor: colors.brand.base,
  },
  cycleDotFertileSelected: {
    backgroundColor: colors.brand.base,
  },
  lengthContent: {
    alignItems: 'center',
  },
  lengthNumber: {
    ...typography.display,
    fontStyle: 'normal',
    fontWeight: '700',
    color: colors.text.muted,
    marginBottom: 4,
  },
  lengthNumberSelected: {
    color: colors.brand.text,
  },
  lengthLabel: {
    ...typography.label,
    fontStyle: 'normal',
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lengthLabelSelected: {
    color: colors.brand.text,
  },
  fertileWindowText: {
    ...typography.label,
    fontWeight: '500',
    color: colors.text.muted,
    marginTop: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.muted,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    marginTop: 40,
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
