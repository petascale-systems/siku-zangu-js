import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {useUser} from '@siku-zangu/react-native';
import {User} from '@siku-zangu/core';
import {
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  NUIButton
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const currentYear = new Date().getFullYear();
const MIN_AGE = 17;
const maxBirthYear = currentYear - MIN_AGE;
const minBirthYear = 1975;

export default function UpdatingDOBScreen() {
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

  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [selectedYear, setSelectedYear] = useState<number>(maxBirthYear);
  const [activePicker, setActivePicker] = useState<'day' | 'month' | 'year'>(
      'day'
  );

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

  const months = [
    {
      label: t('updating_dob.january'),
      value: 0,
      short: 'Jan',
    },
    {
      label: t('updating_dob.february'),
      value: 1,
      short: 'Feb',
    },
    { label: t('updating_dob.march'), value: 2, short: 'Mar' },
    { label: t('updating_dob.april'), value: 3, short: 'Apr' },
    { label: t('updating_dob.may'), value: 4, short: 'May' },
    { label: t('updating_dob.june'), value: 5, short: 'Jun' },
    { label: t('updating_dob.july'), value: 6, short: 'Jul' },
    { label: t('updating_dob.august'), value: 7, short: 'Aug' },
    {
      label: t('updating_dob.september'),
      value: 8,
      short: 'Sep',
    },
    { label: t('updating_dob.october'), value: 9, short: 'Oct' },
    {
      label: t('updating_dob.november'),
      value: 10,
      short: 'Nov',
    },
    {
      label: t('updating_dob.december'),
      value: 11,
      short: 'Dec',
    },
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
      { length: getDaysInMonth(selectedMonth, selectedYear) },
      (_, i) => i + 1
  );

  const years = Array.from(
      { length: maxBirthYear - minBirthYear + 1 },
      (_, i) => minBirthYear + i
  );

  const formatDateToISO = (
      day: number,
      month: number,
      year: number
  ): string => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const isValidDate = (day: number, month: number, year: number): boolean => {
    const date = new Date(year, month, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    );
  };
  const handleSave = async () => {
    if (!userId) {
      showError(t('updating_dob.userIdNotFound'));
      return;
    }

    if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
      showError(t('updating_dob.pleaseSelectAValidDate'));
      return;
    }

    const today = new Date();
    const dob = new Date(selectedYear, selectedMonth, selectedDay);
    const age = today.getFullYear() - dob.getFullYear() -
        (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
    if (age < MIN_AGE) {
      showError(language === 'en'
              ? `You must be at least ${MIN_AGE} years old to use this app.`
              : `Unapaswa kuwa na umri wa miaka ${MIN_AGE} au zaidi kutumia programu hii.`);
      return;
    }

    try {
      const date_of_birth = formatDateToISO(
          selectedDay,
          selectedMonth,
          selectedYear
      );
      const updateData: User = { kv: { date_of_birth } };
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-period',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (error: any) {
      const errorMessage =
          error.message ||
          (t('updating_dob.failedToSaveDateOf'));
      showError(errorMessage);
    }
  };

  const renderDateDisplay = () => (
      <View style={styles.dateDisplay}>
        <TouchableOpacity
            style={[
              styles.dateSegment,
              activePicker === 'day' && styles.activeDateSegment,
            ]}
            onPress={() => setActivePicker('day')}
        >
          <Text
              style={[
                styles.dateSegmentText,
                activePicker === 'day' && styles.activeDateSegmentText,
              ]}
          >
            {selectedDay}
          </Text>
          <Text
              style={[
                styles.dateSegmentLabel,
                activePicker === 'day' && styles.activeDateSegmentLabel,
              ]}
          >
            {t('updating_dob.day')}
          </Text>
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>/</Text>
        </View>

        <TouchableOpacity
            style={[
              styles.dateSegment,
              activePicker === 'month' && styles.activeDateSegment,
            ]}
            onPress={() => setActivePicker('month')}
        >
          <Text
              style={[
                styles.dateSegmentText,
                activePicker === 'month' && styles.activeDateSegmentText,
              ]}
          >
            {months[selectedMonth].short}
          </Text>
          <Text
              style={[
                styles.dateSegmentLabel,
                activePicker === 'month' && styles.activeDateSegmentLabel,
              ]}
          >
            {t('updating_dob.month')}
          </Text>
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>/</Text>
        </View>

        <TouchableOpacity
            style={[
              styles.dateSegment,
              activePicker === 'year' && styles.activeDateSegment,
            ]}
            onPress={() => setActivePicker('year')}
        >
          <Text
              style={[
                styles.dateSegmentText,
                activePicker === 'year' && styles.activeDateSegmentText,
              ]}
          >
            {selectedYear}
          </Text>
          <Text
              style={[
                styles.dateSegmentLabel,
                activePicker === 'year' && styles.activeDateSegmentLabel,
              ]}
          >
            {t('updating_dob.year')}
          </Text>
        </TouchableOpacity>
      </View>
  );

  const renderPicker = () => (
      <View style={styles.pickerContainer}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pickerScrollContent}
        >
          {activePicker === 'day' &&
              days.map((day) => (
                  <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedDay(day)}
                  >
                    <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.selectedPickerItemText,
                        ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
              ))}

          {activePicker === 'month' &&
              months.map((month) => (
                  <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month.value && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                  >
                    <Text
                        style={[
                          styles.pickerItemText,
                          styles.monthPickerItemText,
                          selectedMonth === month.value && styles.selectedMonthPickerItemText,
                        ]}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
              ))}

          {activePicker === 'year' &&
              years.map((year) => (
                  <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedYear(year)}
                  >
                    <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.selectedPickerItemText,
                        ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
  );

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
          <Text style={styles.title}>
            {t('updating_dob.whenWereYouBorn')}
          </Text>
          <Text style={styles.subtitle}>
            {t('updating_dob.knowingYourAgeHelpsUs')}
          </Text>
          {renderDateDisplay()}
          {renderPicker()}
          <Text style={styles.termsText}>
            {language === 'en' ? (
                <>
                  Review our{' '}
                  <Text
                      style={styles.termsConditions}
                      onPress={() => Linking.openURL('https://sikuzangu.org/terms-of-service')}
                  >
                    Terms and Conditions
                  </Text>
                  . You can change your answer on your profile any time.
                </>
            ) : (
                <>
                  Angalia{' '}
                  <Text
                      style={styles.termsConditions}
                      onPress={() => Linking.openURL('https://sikuzangu.org/terms-of-service')}
                  >
                    Sheria na Masharti
                  </Text>{' '}
                  yetu. Unaweza kubadilisha jibu lako kwenye wasifu wako wakati wowote.
                </>
            )}
          </Text>
          <NUIButton
            title={t('updating_dob.next2')}
            onPress={handleSave}
            loading={isUpsertingUser}
            trailingIcon="arrow-forward"
            accessibilityLabel={t('updating_dob.next')}
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
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  dateSegment: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  activeDateSegment: {
    backgroundColor: colors.brand.base,
  },
  dateSegmentText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  activeDateSegmentText: {
    color: colors.text.inverse,
  },
  dateSegmentLabel: {
    ...typography.label,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: 10,
  },
  activeDateSegmentLabel: {
    color: colors.text.inverse,
    opacity: 0.9,
  },
  dateSeparator: {
    paddingHorizontal: 8,
  },
  dateSeparatorText: {
    ...typography.heading,
    fontWeight: '400',
    color: colors.text.muted,
  },
  pickerContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    height: 200,
    marginBottom: 40,
  },
  pickerScrollContent: {
    paddingVertical: 20,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: colors.surface.app,
  },
  pickerItemText: {
    ...typography.headingSm,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  selectedPickerItemText: {
    color: colors.brand.text,
    fontWeight: '700',
  },
  monthPickerItem: {
    paddingVertical: 14,
  },
  selectedMonthPickerItem: {
    backgroundColor: colors.surface.tint,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  monthPickerItemText: {
    ...typography.heading,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  selectedMonthPickerItemText: {
    ...typography.titleSm,
    color: colors.brand.text,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    ...typography.caption,
    fontStyle: 'normal',
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 20,
  },
  termsConditions: {
    color: colors.brand.text,
    fontWeight: '600',
  },
  nextButton: {
    // Layout only — fill, radius, padding and the disabled overlay come from
    // the primary tier in `controls`.
    marginTop: 30,
  },
});