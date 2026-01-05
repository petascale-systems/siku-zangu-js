import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';
import { User } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UpdatingPeriodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { upsertUser, isUpsertingUser } = useUser(userId);

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
      label: language === 'en' ? 'January' : 'Januari',
      value: 0,
      short: 'Jan',
    },
    {
      label: language === 'en' ? 'February' : 'Februari',
      value: 1,
      short: 'Feb',
    },
    { label: language === 'en' ? 'March' : 'Machi', value: 2, short: 'Mar' },
    { label: language === 'en' ? 'April' : 'Aprili', value: 3, short: 'Apr' },
    { label: language === 'en' ? 'May' : 'Mei', value: 4, short: 'May' },
    { label: language === 'en' ? 'June' : 'Juni', value: 5, short: 'Jun' },
    { label: language === 'en' ? 'July' : 'Julai', value: 6, short: 'Jul' },
    { label: language === 'en' ? 'August' : 'Agosti', value: 7, short: 'Aug' },
    {
      label: language === 'en' ? 'September' : 'Septemba',
      value: 8,
      short: 'Sep',
    },
    { label: language === 'en' ? 'October' : 'Oktoba', value: 9, short: 'Oct' },
    {
      label: language === 'en' ? 'November' : 'Novemba',
      value: 10,
      short: 'Nov',
    },
    {
      label: language === 'en' ? 'December' : 'Desemba',
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
      Alert.alert(
          language === 'en' ? 'Error' : 'Hitilafu',
          language === 'en'
              ? 'User ID not found'
              : 'Kitambulisho cha mtumiaji hakipatikani'
      );
      return;
    }

    if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
      Alert.alert(
          language === 'en' ? 'Invalid Date' : 'Tarehe si sahihi',
          language === 'en'
              ? 'Please select a valid date'
              : 'Tafadhali chagua tarehe sahihi'
      );
      return;
    }

    if (!isNotFutureDate(selectedDay, selectedMonth, selectedYear)) {
      Alert.alert(
          language === 'en' ? 'Future Date' : 'Tarehe ya baadaye',
          language === 'en'
              ? 'Period date cannot be in the future'
              : 'Tarehe ya hedhi haiwezi kuwa siku zijazo'
      );
      return;
    }

    try {
      const prev_cycle_start_date = formatDateToISO(
          selectedDay,
          selectedMonth,
          selectedYear
      );
      const updateData: User = { kv: { prev_cycle_start_date } };
      await upsertUser(updateData);
      router.push({
        pathname: '/onboarding/UpdatingPeriodLengthScreen',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (error: any) {
      const errorMessage =
          error.message ||
          (language === 'en'
              ? 'Failed to save date'
              : 'Imeshindwa kuhifadhi tarehe');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
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
            {language === 'en' ? 'DAY' : 'SIKU'}
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
            {language === 'en' ? 'MONTH' : 'MWEZI'}
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
            {language === 'en' ? 'YEAR' : 'MWAKA'}
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

  const getDateContext = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - selectedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return language === 'en' ? 'Today' : 'Leo';
    if (diffDays === 1) return language === 'en' ? 'Yesterday' : 'Jana';
    if (diffDays <= 7) return language === 'en' ? 'This week' : 'Wiki hii';
    if (diffDays <= 30) return language === 'en' ? 'This month' : 'Mwezi huu';
    return language === 'en' ? 'Earlier' : 'Mapema';
  };

  return (
      <View style={styles.container}>
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel={language === 'en' ? 'Go back' : 'Rudi nyuma'}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

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
                  ? 'First day of your last period?'
                  : 'Siku ya kwanza ya hedhi yako ya mwisho?'}
            </Text>

            <Text style={styles.subtitle}>
              {language === 'en'
                  ? 'Not sure? Give us your best guess.'
                  : 'Huna uhakika? Toa makadirio yako bora.'}
            </Text>
          </View>

          {renderDateDisplay()}

          <View style={styles.dateContext}>
            <Ionicons name="calendar-outline" size={16} color="#FD5A7E" />
            <Text style={styles.dateContextText}>{getDateContext()}</Text>
          </View>

          {renderPicker()}

          <TouchableOpacity
              style={[
                styles.nextButton,
                isUpsertingUser && styles.nextButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isUpsertingUser}
              accessibilityLabel={language === 'en' ? 'Next' : 'Ijayo'}
          >
            {isUpsertingUser ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
               <>
                 <Text style={styles.nextButtonText}>
                   {language === 'en' ? 'NEXT' : 'IJAYO'}
                 </Text>
                 <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
               </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 51,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'center',
    color: '#645F5F',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  dateSegment: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  activeDateSegment: {
    backgroundColor: '#FD5A7E',
  },
  dateSegmentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'Inter',
  },
  activeDateSegmentText: {
    color: '#FFFFFF',
  },
  dateSegmentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    marginTop: 10,
    fontFamily: 'Inter',
  },
  activeDateSegmentLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dateSeparator: {
    paddingHorizontal: 8,
  },
  dateSeparatorText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#CCCCCC',
  },
  dateContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dateContextText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FD5A7E',
    marginLeft: 6,
    fontFamily: 'Inter',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
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
    backgroundColor: '#FFF5F2',
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'Inter',
  },
  selectedPickerItemText: {
    color: '#FD5A7E',
    fontWeight: '700',
  },
  monthPickerItem: {
    paddingVertical: 14,
  },
  selectedMonthPickerItem: {
    backgroundColor: '#FFE8EE',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  monthPickerItemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.3,
  },
  selectedMonthPickerItemText: {
    color: '#FD5A7E',
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: '#FD5A7E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB6C1',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontStyle: 'normal',
    fontFamily: 'Inter',
  },
});