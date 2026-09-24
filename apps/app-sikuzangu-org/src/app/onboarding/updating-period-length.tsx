import React, { useEffect, useRef, useState } from 'react';
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
  PERIOD_LENGTH_OPTIONS,
  buildPeriodLengthUpdate,
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  NUIButton,
  useScrollToSelected,
} from '@siku-zangu/expo';
import {User} from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UpdatingPeriodLengthScreen() {
  const { showError } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  const userId = params.userId as string;
  const { user, updateCurrentUser, isUpsertingUser } = useUser(userId);

  const [selectedLength, setSelectedLength] = useState<number>(7);
  const picker = useScrollToSelected(selectedLength, { horizontal: true });

  // Open on what was saved, so going back a step shows the answer already
  // given rather than the default. Once only, and never over a value the
  // user has already picked on this visit.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !user?.kv) return;
    seededRef.current = true;
    const saved = user.kv.avg_period_length_days;
    if (saved && PERIOD_LENGTH_OPTIONS.includes(saved)) setSelectedLength(saved);
  }, [user]);
  const periodLengths = PERIOD_LENGTH_OPTIONS;

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
      showError(t('updating_period_length.userIdNotAvailable'));
      return;
    }

    try {
      // The start was set on the previous screen; the last day follows from it.
      const startISO = user?.kv?.prev_cycle_start_date;
      const updateData: User = {
        kv: startISO
            ? buildPeriodLengthUpdate(startISO, selectedLength, user?.kv?.prev_period_end_date)
            : { avg_period_length_days: selectedLength },
      };
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-cycle-length',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (t('updating_period_length.failedToSavePeriodLength'));
      showError(errorMessage);
    }
  };

  const renderDayIndicator = (length: number) => {
    const isSelected = selectedLength === length;
    const dayDots = Array.from({ length }, (_, i) => (
      <View
        key={i}
        style={[styles.dayDot, isSelected && styles.dayDotSelected]}
      />
    ));

    return <View style={styles.dayIndicator}>{dayDots}</View>;
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
            {t('updating_period_length.howManyDaysDoesYour')}
          </Text>

          <Text style={styles.subtitle}>
            {t('updating_period_length.includeEveryDayWithPeriod')}
          </Text>
        </View>
        <View style={styles.visualIndicator}>
          <View style={styles.periodFlowContainer}>
            <Ionicons name="water-outline" size={20} color="#FD5A7E" />
            <Text style={styles.periodFlowText}>
              {t('updating_period_length.periodFlowDays')}
            </Text>
          </View>
        </View>
        <View style={styles.lengthContainer}>
          <ScrollView
            ref={picker.scrollRef}
            onLayout={picker.onScrollLayout}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {periodLengths.map((length) => (
              <TouchableOpacity
                key={length}
                onLayout={picker.onItemLayout(length)}
                style={[
                  styles.lengthCard,
                  selectedLength === length && styles.lengthCardSelected,
                ]}
                onPress={() => {
                  seededRef.current = true;
                  picker.markTapped(length);
                  setSelectedLength(length);
                }}
                accessibilityLabel={`${length} ${
                  t('updating_period_length.days')
                }`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedLength === length }}
              >
                {renderDayIndicator(length)}
                <View style={styles.lengthContent}>
                  <Text
                    style={[
                      styles.lengthNumber,
                      selectedLength === length && styles.lengthNumberSelected,
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
                    {t('updating_period_length.days2')}
                  </Text>
                </View>
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
            ))}
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
            {t('updating_period_length.youCanChangeYourAnswer')}
          </Text>
        </View>
        <NUIButton
          title={t('updating_period_length.next')}
          onPress={handleSave}
          loading={isUpsertingUser}
          trailingIcon="arrow-forward"
          accessibilityLabel={t('updating_period_length.next')}
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
  periodFlowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  periodFlowText: {
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
  dayIndicator: {
    flexDirection: 'row',
    // Wraps so longer periods stay inside the card instead of stretching it.
    // Fixed height keeps every card in the row the same size.
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 80,
    height: 40,
    marginBottom: 15,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    margin: 2,
  },
  dayDotSelected: {
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
