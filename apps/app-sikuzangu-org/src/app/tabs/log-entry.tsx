import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {UserKv} from '@siku-zangu/core';
import {
  CYCLE_LENGTH_OPTIONS,
  PERIOD_LENGTH_OPTIONS,
  colors,
  getLastLoggedValues,
  getMostRecentLogTimestamp,
  symptomColors,
  typography,
  useLanguage,
  useSession,
  useTabContentInset,
  useTranslate,
  useToast,
  NUIButton
} from '@siku-zangu/expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useRouter
} from 'expo-router';

const toISODate = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')}`;

const sameSelection = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((item) => b.includes(item));

const DAY_CIRCLE_SIZE = 50;
const DAY_CIRCLE_GAP = 8;
const DAY_ITEM_WIDTH = DAY_CIRCLE_SIZE + DAY_CIRCLE_GAP;

/**
 * Horizontally scrollable row of day circles. The ranges are wide enough that
 * they no longer fit on screen, so the saved value is centred on first render
 * to stop a user with a 35-day cycle opening to a row that looks unselected.
 */
function DaysSelector({
  options,
  value,
  onSelect,
  unitLabel,
}: {
  options: number[];
  value: number | null;
  onSelect: (value: number) => void;
  unitLabel: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const viewportWidthRef = useRef(0);
  const hasCenteredRef = useRef(false);

  const centerOnValue = useCallback(() => {
    if (hasCenteredRef.current || value == null) return;
    if (viewportWidthRef.current <= 0) return;

    const index = options.indexOf(value);
    if (index < 0) return;

    hasCenteredRef.current = true;
    const offset =
        index * DAY_ITEM_WIDTH -
        viewportWidthRef.current / 2 +
        DAY_ITEM_WIDTH / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: false });
  }, [options, value]);

  // Centring depends on both the stored value and layout, and either can land
  // first, so it is attempted from both and guarded to run only once.
  useEffect(() => {
    centerOnValue();
  }, [centerOnValue]);

  return (
      <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysSelector}
          contentContainerStyle={styles.daysSelectorContent}
          onLayout={(e) => {
            viewportWidthRef.current = e.nativeEvent.layout.width;
            centerOnValue();
          }}
      >
        {options.map((day) => {
          const isSelected = value === day;
          return (
              <TouchableOpacity
                  key={day}
                  style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}
                  onPress={() => onSelect(day)}
                  accessibilityLabel={`${day} ${unitLabel}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
              >
                <Text
                    style={[styles.dayText, isSelected && styles.dayTextSelected]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
          );
        })}
      </ScrollView>
  );
}

export default function LogEntry() {
  const { showError, showInfo, showSuccess } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  // From the session store, not the route params: the native tab navigator
  // switches tabs without params, so params.userId was undefined on every tab
  // except the one that was navigated to directly.
  const { userId } = useSession();
  const tabInset = useTabContentInset();
  // The hook exposes this as `error`; it was destructured as `fetchError`, so
  // the error banner below never rendered.
  const { updateCurrentUser, isUpsertingUser, user, error: fetchError } =
      useUser(userId);

  const symptoms = [
    {
      key: 'cramps',
      label: t('log_entry.cramps'),
      icon: 'fitness-outline',
      color: colors.state.warning,
    },
    {
      key: 'fatigue',
      label: t('log_entry.fatigue'),
      icon: 'flash-outline',
      color: symptomColors.fatigue,
    },
    {
      key: 'bloating',
      label: t('log_entry.bloating'),
      icon: 'water-outline',
      color: symptomColors.bloating,
    },
    {
      key: 'tender_breast',
      label: t('log_entry.tenderBreasts'),
      icon: 'female-outline',
      color: symptomColors.tender_breast,
    },
    {
      key: 'backache',
      label: t('log_entry.backache'),
      icon: 'body-outline',
      color: colors.state.error,
    },
    {
      key: 'headache',
      label: t('log_entry.headache'),
      icon: 'medkit-outline',
      color: colors.state.success,
    },
  ];

  const moods = [
    {
      key: 'happy',
      label: t('log_entry.happy'),
      emoji: '😊',
      color: '#FFF9C4',
    },
    {
      key: 'sad',
      label: t('log_entry.sad'),
      emoji: '😢',
      color: '#E1F5FE',
    },
    {
      key: 'tired',
      label: t('log_entry.tired'),
      emoji: '😴',
      color: '#F3E5F5',
    },
    {
      key: 'anxious',
      label: t('log_entry.anxious'),
      emoji: '😟',
      color: '#FCE4EC',
    },
    {
      key: 'calm',
      label: t('log_entry.calm'),
      emoji: '😌',
      color: '#E8F5E9',
    },
    {
      key: 'curious',
      label: t('log_entry.curious'),
      emoji: '🤔',
      color: '#FFF3E0',
    },
  ];
  const medications = [
    {
      key: 'pain_relief',
      label: t('log_entry.painRelief'),
      icon: '💊',
      color: '#FFEBEE',
    },
    {
      key: 'herbal_supplement',
      label: t('log_entry.herbalSupplement'),
      icon: '🌿',
      color: '#E8F5E9',
    },
    {
      key: 'hormone_therapy',
      label: t('log_entry.hormoneTherapy'),
      icon: '💉',
      color: '#E1F5FE',
    },
    {
      key: 'birth_control',
      label: t('log_entry.birthControl'),
      icon: '🌸',
      color: '#F3E5F5',
    },
  ];

  const months =
      language === 'en'
          ? [
            { value: 0, label: 'Jan' },
            { value: 1, label: 'Feb' },
            { value: 2, label: 'Mar' },
            { value: 3, label: 'Apr' },
            { value: 4, label: 'May' },
            { value: 5, label: 'Jun' },
            { value: 6, label: 'Jul' },
            { value: 7, label: 'Aug' },
            { value: 8, label: 'Sep' },
            { value: 9, label: 'Oct' },
            { value: 10, label: 'Nov' },
            { value: 11, label: 'Dec' },
          ]
          : [
            { value: 0, label: 'Januari' },
            { value: 1, label: 'Februari' },
            { value: 2, label: 'Machi' },
            { value: 3, label: 'Aprili' },
            { value: 4, label: 'Mei' },
            { value: 5, label: 'Juni' },
            { value: 6, label: 'Julai' },
            { value: 7, label: 'Agosti' },
            { value: 8, label: 'Septemba' },
            { value: 9, label: 'Oktoba' },
            { value: 10, label: 'Novemba' },
            { value: 11, label: 'Desemba' },
          ];

  const initialValuesRef = useRef({
    lastPeriodDays: null as number | null,
    avgCycleDays: null as number | null,
    prevCycleStart: '' as string,
  });

  // What the user last logged, used both to pre-tick the pickers and to tell a
  // genuine new entry from simply re-opening the screen.
  const initialSelectionsRef = useRef({
    symptoms: [] as string[],
    moods: [] as string[],
    medications: [] as string[],
    loggedOn: '' as string,
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const [lastPeriodDays, setLastPeriodDays] = useState<number | null>(null);
  const [avgCycleDays, setAvgCycleDays] = useState<number | null>(null);
  // The date pickers default to today, so a user who never stored a cycle start
  // would otherwise always look like they changed it. Only an explicit tap counts.
  const [dateTouched, setDateTouched] = useState(false);
  const currentDate = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(
      currentDate.getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
      currentDate.getFullYear()
  );

  // Seed form state from the server ONCE per user. Re-running on every `user`
  // identity would wipe whatever the person is part-way through entering: a
  // background refetch or a save on another screen pushes a new identity, and
  // resetting `dateTouched` here would also make Save silently drop
  // prev_cycle_start_date while still reporting success.
  const hasSeededRef = useRef(false);
  // Set as soon as the user touches anything. The seed below runs on every
  // change to `user`, and a background refetch lands a new object while the
  // form is being filled in — without this it overwrote the in-progress
  // selection with whatever was last logged, which read as "my changes
  // reverted on save".
  const isDirtyRef = useRef(false);

  useEffect(() => {
    hasSeededRef.current = false;
  }, [userId]);

  // A tab is never unmounted, so without this the form would keep whatever it
  // seeded on the very first visit. Re-seed each time the tab is opened.
  useFocusEffect(
      useCallback(() => {
        hasSeededRef.current = false;
        // A fresh visit starts clean, so re-seeding is correct again.
        isDirtyRef.current = false;
      }, [])
  );

  useEffect(() => {
    // `user` is undefined on the first render after a cold focus, so the guard
    // above is not enough on its own: the seed would simply run later, once the
    // fetch resolved, by which point the user may already be selecting.
    if (!user?.kv || hasSeededRef.current || isDirtyRef.current) return;
    hasSeededRef.current = true;
    const periodDays = user.kv.avg_period_length_days ?? null;
    const cycleDays = user.kv.avg_cycle_length_days ?? null;
    const prevDate = user.kv.prev_cycle_start_date || '';

    setLastPeriodDays(periodDays);
    setAvgCycleDays(cycleDays);
    initialValuesRef.current = {
      lastPeriodDays: periodDays,
      avgCycleDays: cycleDays,
      prevCycleStart: prevDate,
    };
    if (prevDate) {
      const d = new Date(prevDate);
      const day = d.getDate();
      const month = d.getMonth();
      const year = d.getFullYear();
      setSelectedDay(day);
      setSelectedMonth(month);
      setSelectedYear(year);
    }
    // Pre-tick the current selections so an occasional user confirms rather
    // than re-enters.
    //
    // Read straight from `selected_*`, the same source "Your Log" shows on
    // Home. Re-deriving them from the log entries here would let the two
    // screens disagree, and the dirty-check below compares against this seed —
    // a seed that did not match what the user was shown would make Save look
    // like a no-op, or submit something they never saw.
    //
    // The same fallback Home uses, and it has to be the same: the dirty-check
    // below compares the selection against this seed, so a seed that did not
    // match what the user was shown would make Save look like a no-op.
    const lastSymptoms =
        user.kv.selected_symptoms ??
        getLastLoggedValues(user.kv.symptom_logs, (log) => log.symptom);
    const lastMoods =
        user.kv.selected_moods ??
        getLastLoggedValues(user.kv.mood_logs, (log) => log.mood);
    const lastMedications =
        user.kv.selected_medications ??
        getLastLoggedValues(user.kv.medication_logs, (log) => log.medication);
    // The entries still date the seed, since `selected_*` carries no timestamp.
    const lastLoggedOn = getMostRecentLogTimestamp(
        user.kv.symptom_logs,
        user.kv.mood_logs,
        user.kv.medication_logs
    );

    setSelectedSymptoms(lastSymptoms);
    setSelectedMoods(lastMoods);
    setSelectedMedications(lastMedications);
    initialSelectionsRef.current = {
      symptoms: lastSymptoms,
      moods: lastMoods,
      medications: lastMedications,
      loggedOn: lastLoggedOn ? toISODate(new Date(lastLoggedOn)) : '',
    };
    setDateTouched(false);
  }, [user]);
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const days = Array.from(
      { length: getDaysInMonth(selectedMonth, selectedYear) },
      (_, i) => i + 1
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i);
  const toggleSelection = (
      list: string[],
      setList: (v: string[]) => void,
      key: string
  ) => {
    isDirtyRef.current = true;
    if (list.includes(key)) {
      setList(list.filter((item) => item !== key));
    } else {
      setList([...list, key]);
    }
  };
  const formatDateToISO = (): string => {
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    return `${selectedYear}-${monthStr}-${dayStr}`;
  };
  const isValidDate = (): boolean => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    return (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth &&
        date.getDate() === selectedDay
    );
  };
  const isNotFutureDate = (): boolean => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    return selectedDate <= currentDate;
  };
  const hasCycleStartChanged = (): boolean =>
      dateTouched && formatDateToISO() !== initialValuesRef.current.prevCycleStart;

  // True when the user actually touched cycle data, as opposed to only logging
  // a mood/symptom/medication. Drives which validation applies on save.
  const hasCycleChanges = (): boolean =>
      lastPeriodDays !== initialValuesRef.current.lastPeriodDays ||
      avgCycleDays !== initialValuesRef.current.avgCycleDays ||
      hasCycleStartChanged();

  // The pickers open pre-ticked, so "something is selected" no longer means the
  // user entered anything. A save is a real log when the selection differs from
  // what was last logged, or when it is simply a new day.
  const isNewLoggingDay = (): boolean =>
      initialSelectionsRef.current.loggedOn !== toISODate(new Date());

  const symptomsChanged = (): boolean =>
      !sameSelection(selectedSymptoms, initialSelectionsRef.current.symptoms);

  const moodsChanged = (): boolean =>
      !sameSelection(selectedMoods, initialSelectionsRef.current.moods);

  // An emptied selection is a real submission: it says "none of these now", and
  // the server records it as a clearing event. Requiring a non-empty selection
  // here meant unticking your last symptom sent nothing at all, so the old one
  // stayed on screen with no way to remove it.
  //
  // A new day still re-logs an unchanged selection, but only when there is
  // something to log — an empty selection that has not changed says nothing.
  const shouldLogSymptoms = (): boolean =>
      symptomsChanged() || (selectedSymptoms.length > 0 && isNewLoggingDay());

  const shouldLogMoods = (): boolean =>
      moodsChanged() || (selectedMoods.length > 0 && isNewLoggingDay());

  const medicationsChanged = (): boolean =>
      !sameSelection(selectedMedications, initialSelectionsRef.current.medications);

  const shouldLogMedications = (): boolean =>
      medicationsChanged() ||
      (selectedMedications.length > 0 && isNewLoggingDay());

  const hasChanges = (): boolean => {
    return (
        shouldLogSymptoms() ||
        shouldLogMoods() ||
        shouldLogMedications() ||
        hasCycleChanges()
    );
  };
  const renderPicker = (
      label: string,
      options: number[],
      selectedValue: number,
      onSelect: (value: number) => void,
      isMonth = false
  ) => {
    return (
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{label}</Text>
          <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
          >
            {options.map((option) => {
              const displayValue = isMonth
                  ? months[option].label
                  : option.toString();
              const isSelected = selectedValue === option;

              return (
                  <TouchableOpacity
                      key={option}
                      style={[
                        styles.pickerOption,
                        isSelected && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        isDirtyRef.current = true;
                        setDateTouched(true);
                        onSelect(option);
                      }}
                  >
                    <Text
                        style={[
                          styles.pickerOptionText,
                          isSelected && styles.pickerOptionTextSelected,
                        ]}
                    >
                      {displayValue}
                    </Text>
                  </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
    );
  };

  const handleSave = async () => {
    // Check if there are any changes
    if (!hasChanges()) {
      showInfo(t('log_entry.nothingNewToSave'));
      return;
    }

    // These guards protect cycle data only. A mood/symptom-only entry carries
    // none, so requiring them would block a user who just wants to log a mood.
    if (hasCycleChanges()) {
      if (!lastPeriodDays) {
        showError(t('log_entry.pleaseSelectHowLongYour'));
        return;
      }

      if (!avgCycleDays) {
        showError(t('log_entry.pleaseSelectYourAverageMenstrual'));
        return;
      }

      if (!isValidDate()) {
        showError(t('log_entry.pleaseSelectAValidDate'));
        return;
      }

      if (!isNotFutureDate()) {
        showError(t('log_entry.periodDateCannotBeIn'));
        return;
      }
    }

    // Each array is the complete set ticked right now, not an addition to
    // what came before — so unticking an item is how it gets dropped. The
    // server appends the set to the history and stores it as the current one.
    //
    // Rebuilding the whole history here is what used to overwrite it, and what
    // capped it at the size of a single database cell.
    const updates: UserKv = {};
    if (shouldLogSymptoms()) {
      const newLogs = selectedSymptoms.map((symptom) => ({
        symptom,
        timestamp: new Date().toISOString(),
      }));
      updates.symptom_logs = newLogs;
    }
    if (shouldLogMoods()) {
      const newLogs = selectedMoods.map((mood) => ({
        mood,
        timestamp: new Date().toISOString(),
      }));
      updates.mood_logs = newLogs;
    }
    if (shouldLogMedications()) {
      const newLogs = selectedMedications.map((medication) => ({
        medication,
        timestamp: new Date().toISOString(),
      }));
      updates.medication_logs = newLogs;
    }
    if (
        lastPeriodDays != null &&
        lastPeriodDays !== initialValuesRef.current.lastPeriodDays
    ) {
      updates.avg_period_length_days = lastPeriodDays;
    }
    if (
        avgCycleDays != null &&
        avgCycleDays !== initialValuesRef.current.avgCycleDays
    ) {
      updates.avg_cycle_length_days = avgCycleDays;
    }
    if (hasCycleStartChanged()) {
      updates.prev_cycle_start_date = formatDateToISO();
    }

    if (Object.keys(updates).length === 0) {
      showInfo(t('log_entry.nothingNewToSave'));
      return;
    }

    try {
      await updateCurrentUser({ kv: updates });

      showSuccess(t('log_entry.logSavedSuccessfully'));

      // Update initial values ref. Only claim a stored cycle start if we
      // actually sent one, otherwise an untouched date looks like saved data.
      initialValuesRef.current = {
        lastPeriodDays,
        avgCycleDays,
        prevCycleStart:
            updates.prev_cycle_start_date ??
            initialValuesRef.current.prevCycleStart,
      };

      // Re-baseline instead of clearing: the pickers stay pre-ticked with what
      // was just logged, and saving again without edits is correctly a no-op.
      initialSelectionsRef.current = {
        symptoms: selectedSymptoms,
        moods: selectedMoods,
        medications: selectedMedications,
        loggedOn:
            updates.symptom_logs || updates.mood_logs || updates.medication_logs
                ? toISODate(new Date())
                : initialSelectionsRef.current.loggedOn,
      };
      setDateTouched(false);

      // Log Entry is a tab, not a pushed screen — router.back() has nothing to
      // pop, so the user stayed here and the save looked like a no-op. Switch
      // to Home, which is where the updated log is shown.
      router.replace('/tabs/home');
    } catch (e: any) {
      showError(e.message || 'Failed to save');
    }
  };


  return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>
            {t('log_entry.logEntry')}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {fetchError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{fetchError}</Text>
            </View>
        )}

        <ScrollView
            showsVerticalScrollIndicator={false}
            // UIKit already insets scroll content for the tab bar; this is the
            // cross-platform backstop so the last card clears it on Android too.
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: tabInset },
            ]}
            nestedScrollEnabled={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('log_entry.logYourSymptoms')}
            </Text>
            <View style={styles.symptomsGrid}>
              {symptoms.map((item) => {
                const isSelected = selectedSymptoms.includes(item.key);
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.symptomCard,
                          isSelected && styles.symptomCardSelected,
                        ]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={item.label}
                        onPress={() =>
                            toggleSelection(
                                selectedSymptoms,
                                setSelectedSymptoms,
                                item.key
                            )
                        }
                    >
                      <Ionicons
                          name={item.icon as any}
                          size={24}
                          color={item.color}
                      />
                      <Text
                          style={[
                            styles.symptomLabel,
                            isSelected && styles.symptomLabelSelected,
                          ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                          <View style={styles.checkmark}>
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
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('log_entry.cycleDetails')}
            </Text>
            <View style={styles.cycleDetailCard}>
              <Text style={styles.cycleDetailLabel}>
                {t('log_entry.lastPeriodLastedFor')}
              </Text>
              <DaysSelector
                  options={PERIOD_LENGTH_OPTIONS}
                  value={lastPeriodDays}
                  onSelect={(value) => {
                    isDirtyRef.current = true;
                    setLastPeriodDays(value);
                  }}
                  unitLabel={t('log_entry.days')}
              />
            </View>
            <View style={styles.cycleDetailCard}>
              <Text style={styles.cycleDetailLabel}>
                {t('log_entry.myAverageMenstrualCycleIs')}
              </Text>
              <DaysSelector
                  options={CYCLE_LENGTH_OPTIONS}
                  value={avgCycleDays}
                  onSelect={(value) => {
                    isDirtyRef.current = true;
                    setAvgCycleDays(value);
                  }}
                  unitLabel={t('log_entry.days')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('log_entry.medication')}
            </Text>
            <View style={styles.medicationList}>
              {medications.map((item) => {
                const isSelected = selectedMedications.includes(item.key);
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.medicationCard,
                          { backgroundColor: item.color },
                          isSelected && styles.medicationCardSelected,
                        ]}
                        onPress={() =>
                            toggleSelection(
                                selectedMedications,
                                setSelectedMedications,
                                item.key
                            )
                        }
                    >
                      <Text style={styles.medicationIcon}>{item.icon}</Text>
                      <Text style={styles.medicationLabel}>{item.label}</Text>
                      {isSelected && (
                          <View style={styles.medicationCheck}>
                            <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#FD5A7E"
                            />
                          </View>
                      )}
                    </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('log_entry.logYourMood')}
            </Text>
            <View style={styles.moodsGrid}>
              {moods.map((item) => {
                const isSelected = selectedMoods.includes(item.key);
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.moodCard,
                          { backgroundColor: item.color },
                          isSelected && styles.moodCardSelected,
                        ]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={item.label}
                        onPress={() =>
                            toggleSelection(selectedMoods, setSelectedMoods, item.key)
                        }
                    >
                      <Text style={styles.moodEmoji}>{item.emoji}</Text>
                      <Text
                          style={[
                            styles.moodLabel,
                            isSelected && styles.moodLabelSelected,
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
              {t('log_entry.startDateOfLastPeriod')}
            </Text>
            <View style={styles.datePreview}>
              <Ionicons name="calendar-outline" size={18} color="#FF6B9D" />
              <Text style={styles.datePreviewText}>
                {`${selectedDay} ${months[selectedMonth].label} ${selectedYear}`}
              </Text>
            </View>
            <View style={styles.datePickerRow}>
              {renderPicker(
                  t('log_entry.day'),
                  days,
                  selectedDay,
                  setSelectedDay
              )}
              {renderPicker(
                  t('log_entry.month'),
                  Array.from({ length: 12 }, (_, i) => i),
                  selectedMonth,
                  setSelectedMonth,
                  true
              )}
              {renderPicker(
                  t('log_entry.year'),
                  years,
                  selectedYear,
                  setSelectedYear
              )}
            </View>
          </View>

          <NUIButton
              title={t('log_entry.save')}
              onPress={handleSave}
              loading={isUpsertingUser}
              style={styles.saveButton}
          />
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // A tab root has no parent to go back to, so the back button that used to
    // sit here was always a no-op and has been removed; the title centres on
    // its own rather than being spread by space-between.
    justifyContent: 'center',
    paddingHorizontal: 16,
    // The title sits in a bar of its own, matching the platform header that
    // every pushed screen now uses. Without it the top of a tab root was bare
    // canvas, so moving from Profile into Change PIN flipped the top band from
    // grey to white. The safe-area inset is applied inline so the bar runs
    // behind the status bar rather than starting below it.
    backgroundColor: colors.surface.card,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    color: colors.state.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    fontStyle: 'normal',
    marginBottom: 15,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: colors.surface.muted,
    // Reserved, as above, so selecting does not resize the tile.
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomCardSelected: {
    borderColor: colors.brand.base,
    backgroundColor: colors.surface.tint,
  },
  symptomIcon: {
    ...typography.displaySm,
    fontWeight: '400',
    marginBottom: 8,
  },
  symptomLabel: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  symptomLabelSelected: {
    fontWeight: '600',
    color: colors.brand.text,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cycleDetailCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cycleDetailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'normal',
    fontWeight: '500',
    marginBottom: 12,
  },
  daysSelector: {
    // Bleed past the card's 16px padding so the row scrolls edge to edge and
    // visibly continues, rather than looking like it ends at the card border.
    marginHorizontal: -16,
  },
  daysSelectorContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dayCircle: {
    width: DAY_CIRCLE_SIZE,
    height: DAY_CIRCLE_SIZE,
    borderRadius: DAY_CIRCLE_SIZE / 2,
    backgroundColor: colors.surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DAY_CIRCLE_GAP,
  },
  dayCircleSelected: {
    backgroundColor: colors.surface.tint,
  },
  dayText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.muted,
  },
  dayTextSelected: {
    color: colors.brand.text,
  },
  medicationList: {
    gap: 12,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  medicationCardSelected: {
    borderWidth: 2,
    borderColor: colors.brand.base,
  },
  medicationIcon: {
    ...typography.title,
    fontWeight: '400',
    marginRight: 12,
  },
  medicationLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  medicationCheck: {
    position: 'absolute',
    right: 12,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    // Reserve the selection border in both states. It used to appear only when
    // selected, so each tap grew the tile by 4pt and nudged the grid.
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCardSelected: {
    borderColor: colors.brand.base,
  },
  moodEmoji: {
    ...typography.display,
    fontWeight: '400',
    marginBottom: 8,
  },
  moodLabel: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    fontWeight: '600',
    color: colors.brand.text,
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  datePreviewText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  pickerLabel: {
    ...typography.label,
    fontWeight: '600',
    color: colors.text.muted,
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 150,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    // minHeight, not height: the row holds a label, and a fixed height clips it
    // the moment OS font scaling is raised.
    minHeight: 40,
  },
  pickerOptionSelected: {
    backgroundColor: colors.surface.tint,
  },
  pickerOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  pickerOptionTextSelected: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.brand.text,
  },
  saveButton: {
    // Layout only. The `fontStyle`/`fontWeight` that used to sit here never
    // applied — a View does not inherit text style to its children.
    marginTop: 10,
  },
});