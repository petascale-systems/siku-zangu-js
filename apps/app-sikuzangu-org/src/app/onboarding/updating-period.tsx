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

export default function UpdatingPeriodScreen() {
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

  const currentDate = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(
      currentDate.getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
      currentDate.getFullYear()
  );
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
      label: t('updating_period.january'),
      value: 0,
      short: 'Jan',
    },
    {
      label: t('updating_period.february'),
      value: 1,
      short: 'Feb',
    },
    { label: t('updating_period.march'), value: 2, short: 'Mar' },
    { label: t('updating_period.april'), value: 3, short: 'Apr' },
    { label: t('updating_period.may'), value: 4, short: 'May' },
    { label: t('updating_period.june'), value: 5, short: 'Jun' },
    { label: t('updating_period.july'), value: 6, short: 'Jul' },
    { label: t('updating_period.august'), value: 7, short: 'Aug' },
    {label: t('updating_period.september'), value: 8, short: 'Sep',},
    { label: t('updating_period.october'), value: 9, short: 'Oct' },
    {label: t('updating_period.november'), value: 10, short: 'Nov',},
    {label: t('updating_period.december'), value: 11, short: 'Dec',},
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
      { length: getDaysInMonth(selectedMonth, selectedYear) },
      (_, i) => i + 1
  );
  const years = Array.from(
      { length: 4 },
      (_, i) => currentDate.getFullYear() - 3 + i
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

  const isNotFutureDate = (
      day: number,
      month: number,
      year: number
  ): boolean => {
    const selectedDate = new Date(year, month, day);
    return selectedDate <= currentDate;
  };

  const handleSave = async () => {
    if (!userId) {
      showError(t('updating_period.userIdNotFound'));
      return;
    }

    if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
      showError(t('updating_period.pleaseSelectAValidDate'));
      return;
    }

    if (!isNotFutureDate(selectedDay, selectedMonth, selectedYear)) {
      showError(t('updating_period.periodDateCannotBeIn'));
      return;
    }

    try {
      const prev_cycle_start_date = formatDateToISO(
          selectedDay,
          selectedMonth,
          selectedYear
      );
      const updateData: User = { kv: { prev_cycle_start_date } };
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-period-length',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (error: any) {
      const errorMessage =
          error.message ||
          (t('updating_period.failedToSaveDate'));
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
            {t('updating_period.day')}
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
            {t('updating_period.month')}
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
            {t('updating_period.year')}
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
                        styles.monthPickerItem,
                        selectedMonth === month.value && styles.selectedMonthPickerItem,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                  >
                    <Text
                        style={[
                          styles.pickerItemText,
                          styles.monthPickerItemText,
                          selectedMonth === month.value &&
                          styles.selectedMonthPickerItemText,
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
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('updating_period.firstDayOfYourLast')}
            </Text>

            <Text style={styles.subtitle}>
              {t('updating_period.notSureGiveUsYour')}
            </Text>
          </View>

          {renderDateDisplay()}
          {renderPicker()}

          <NUIButton
            title={t('updating_period.next2')}
            onPress={handleSave}
            loading={isUpsertingUser}
            trailingIcon="arrow-forward"
            accessibilityLabel={t('updating_period.next')}
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
  dateContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dateContextText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text.secondary,
    marginLeft: 6,
  },
  pickerContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    height: 200,
    marginBottom: 30,
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
  nextButton: {
    // Layout only — fill, radius, padding and the disabled overlay come from
    // the primary tier in `controls`.
    marginTop: 30,
  },
});