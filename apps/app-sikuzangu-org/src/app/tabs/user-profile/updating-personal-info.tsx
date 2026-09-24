import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {User} from '@siku-zangu/core';
import {
  colors,
  typography,
  useLanguage,
  useTabContentInset,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  useResetStackOnBlur,
  inputTraits,
  NUIFormField,
  fieldError,
  nameField,
  MAX_NAME_LENGTH,
  NUIButton,
  layout,
  spacing,
  radius,
  NUICard,
  useScrollToSelected,
} from '@siku-zangu/expo';
import {useLocalSearchParams} from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type EditSection = 'name' | 'dob' | null;

const currentYear = new Date().getFullYear();
const MIN_AGE = 17;
const maxBirthYear = currentYear - MIN_AGE;
const minBirthYear = 1975;

export default function UpdatePersonalInfoScreen() {
  // Leaving the Profile tab returns it to the Profile screen.
  useResetStackOnBlur();
  const { showError, showSuccess } = useToast();
    // Was at module scope, which is an invalid hook call: it runs once on
    // import, outside any component, and throws before the screen can render.
    const tabInset = useTabContentInset();
    const params = useLocalSearchParams();
  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
    const userId = params.userId as string;
    const { user, updateCurrentUser, isUpsertingUser, isFetchingUser, isInitialFetching, isBackgroundFetching } = useUser(userId);

    // The family-name field, so the given-name field's "next" key has
    // somewhere to go. `submitBehavior: 'submit'` keeps the keyboard up
    // across the move; the default blurs first and it visibly flickers.
    const lastNameRef = useRef<TextInput>(null);

    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(maxBirthYear);
    const [activePicker, setActivePicker] = useState<'day' | 'month' | 'year'>('day');

    const [editingSection, setEditingSection] = useState<EditSection>(null);

    // Seed once per user: re-running on every `user` identity reverted whatever
    // the person had typed whenever a background refetch landed, and the
    // subsequent save then wrote the stale value back.
    const hasSeededRef = useRef(false);

    useEffect(() => {
        hasSeededRef.current = false;
    }, [userId]);

    useEffect(() => {
        if (user && !isFetchingUser && !hasSeededRef.current) {
            hasSeededRef.current = true;
            nameForm.setFieldValue('firstName', user.kv?.first_name || '');
            nameForm.setFieldValue('lastName', user.kv?.last_name || '');

            if (user.kv?.date_of_birth) {
                const dob = new Date(user.kv.date_of_birth);
                setSelectedDay(dob.getDate());
                setSelectedMonth(dob.getMonth());
                setSelectedYear(dob.getFullYear());
            }
        }
    }, [user, isFetchingUser]);

    const months = [
        { label: t('updating_personal_info.january'), value: 0, short: 'Jan' },
        { label: t('updating_personal_info.february'), value: 1, short: 'Feb' },
        { label: t('updating_personal_info.march'), value: 2, short: 'Mar' },
        { label: t('updating_personal_info.april'), value: 3, short: 'Apr' },
        { label: t('updating_personal_info.may'), value: 4, short: 'May' },
        { label: t('updating_personal_info.june'), value: 5, short: 'Jun' },
        { label: t('updating_personal_info.july'), value: 6, short: 'Jul' },
        { label: t('updating_personal_info.august'), value: 7, short: 'Aug' },
        { label: t('updating_personal_info.september'), value: 8, short: 'Sep' },
        { label: t('updating_personal_info.october'), value: 9, short: 'Oct' },
        { label: t('updating_personal_info.november'), value: 10, short: 'Nov' },
        { label: t('updating_personal_info.december'), value: 11, short: 'Dec' },
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

    /** One schema behind both inline errors and the submit. See login.tsx. */
    const namesSchema = useMemo(
        () =>
            z.object({
                firstName: nameField({
                    required: t('updating_personal_info.firstNameIsRequired'),
                    tooLong:
                        language === 'en'
                            ? `First name must be at most ${MAX_NAME_LENGTH} characters`
                            : `Jina la kwanza linapaswa kuwa hadi herufi ${MAX_NAME_LENGTH}`,
                }),
                // No `required`: the surname is optional.
                lastName: nameField({
                    tooLong:
                        language === 'en'
                            ? `Last name must be at most ${MAX_NAME_LENGTH} characters`
                            : `Jina la mwisho linapaswa kuwa hadi herufi ${MAX_NAME_LENGTH}`,
                }),
            }),
        [t, language]
    );

    const nameForm = useForm({
        defaultValues: { firstName: '', lastName: '' },
        // `revalidateLogic` + a single `onDynamic` validator, not one validator per
        // event. TanStack keeps an error PER SOURCE — `errorMap.onBlur`,
        // `errorMap.onChange`, `errorMap.onSubmit` — and a later `onChange` pass
        // only replaces its own entry. Because these validators are form-level,
        // blurring the phone field validated the whole object and stamped
        // "PIN is required" onto the still-empty PIN under `errorMap.onBlur`.
        // Typing the PIN cleared `onChange` but left `onBlur` untouched, so the
        // message was still there — and surfaced the moment Login was pressed.
        // One source, replaced on every run, cannot go stale.
        validationLogic: revalidateLogic({
            mode: 'change',
            modeAfterSubmission: 'change',
        }),
        validators: { onDynamic: namesSchema },
        onSubmit: async ({ value }) => {
            await handleSaveName(value);
        },
    });

    // A failed submit reveals every field's error at once, including fields
    // the user never visited — otherwise pressing the button on an untouched
    // form would do nothing visible.
    const showErrors = useStore(nameForm.store, (s) => s.submissionAttempts > 0);

    const formatDateToISO = (day: number, month: number, year: number): string => {
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

    const handleSaveName = async ({
        firstName,
        lastName,
    }: {
        firstName: string;
        lastName: string;
    }) => {
        // Names are validated by `namesSchema`; only the request is left.
        try {
            const updateData: User = {
                kv: {
                    first_name: firstName.trim(),
                },
            };
            if (lastName.trim()) {
                updateData.kv!.last_name = lastName.trim();
            }
            await updateCurrentUser(updateData);
            setEditingSection(null);
            showSuccess(t('updating_personal_info.nameUpdatedSuccessfully'));
        } catch (e: any) {
            showError(e.message || (t('updating_personal_info.failedToUpdateName')));
        }
    };

    const handleSaveDOB = async () => {
        if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
            showError(t('updating_personal_info.pleaseSelectAValidDate'));
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
            const date_of_birth = formatDateToISO(selectedDay, selectedMonth, selectedYear);
            const updateData: User = { kv: { date_of_birth } };
            await updateCurrentUser(updateData);
            setEditingSection(null);
            showSuccess(t('updating_personal_info.dateOfBirthUpdatedSuccessfully'));
        } catch (error: any) {
            showError(error.message ||
                (t('updating_personal_info.failedToSaveDateOf')));
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
                    {t('updating_personal_info.day')}
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
                    {t('updating_personal_info.month')}
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
                    {t('updating_personal_info.year')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    // One list shows day, month or year in turn; keying the selection by list
    // makes switching lists re-centre on that list's value.
    const pickerSelected =
        activePicker === 'day'
            ? `day:${selectedDay}`
            : activePicker === 'month'
                ? `month:${selectedMonth}`
                : `year:${selectedYear}`;
    const picker = useScrollToSelected(pickerSelected);

    const renderPicker = () => (
        <View style={styles.pickerContainer}>
            <ScrollView
                ref={picker.scrollRef}
                onLayout={picker.onScrollLayout}
                style={{ maxHeight: 150 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {activePicker === 'day' &&
                    days.map((day) => (
                        <TouchableOpacity
                            key={day}
                            onLayout={picker.onItemLayout(`day:${day}`)}
                            style={[
                                styles.pickerItem,
                                selectedDay === day && styles.selectedPickerItem,
                            ]}
                            onPress={() => {
                              picker.markTapped(`day:${day}`);
                              setSelectedDay(day);
                            }}
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
                            onLayout={picker.onItemLayout(`month:${month.value}`)}
                            style={[
                                styles.pickerItem,
                                selectedMonth === month.value && styles.selectedPickerItem,
                            ]}
                            onPress={() => {
                              picker.markTapped(`month:${month.value}`);
                              setSelectedMonth(month.value);
                            }}
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
                            onLayout={picker.onItemLayout(`year:${year}`)}
                            style={[
                                styles.pickerItem,
                                selectedYear === year && styles.selectedPickerItem,
                            ]}
                            onPress={() => {
                              picker.markTapped(`year:${year}`);
                              setSelectedYear(year);
                            }}
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

    if (isInitialFetching && !user) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#FF5C8D" />
                <Text style={styles.loadingText}>
                    {language === 'sw' ? 'Inapakia...' : 'Loading...'}
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {isBackgroundFetching && (
                <View style={{ position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
                    <ActivityIndicator size="small" color="#FF5C8D" />
                </View>
            )}
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInset }]}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                <View>
                    <NUICard style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <Ionicons name="person" size={20} color="#FF597D" />
                                <Text style={styles.sectionTitle}>
                                    {language === 'sw' ? 'Jina' : 'Name'}
                                </Text>
                            </View>
                            {editingSection !== 'name' && (
                                <TouchableOpacity onPress={() => setEditingSection('name')}>
                                    <Ionicons name="create-outline" size={20} color="#FF597D" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {editingSection === 'name' ? (
                            <View style={styles.editContainer}>
                                <nameForm.Field name="firstName">
                                    {(field) => (
                                        <NUIFormField
                                            {...inputTraits.givenName}
                                            label={t('updating_personal_info.firstNameRequired')}
                                            error={fieldError(field, showErrors)}
                                            placeholder={t('updating_personal_info.enterFirstName')}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChangeText={field.handleChange}
                                            onSubmitEditing={() => lastNameRef.current?.focus()}
                                            submitBehavior="submit"
                                            maxLength={MAX_NAME_LENGTH}
                                            editable={!isUpsertingUser}
                                        />
                                    )}
                                </nameForm.Field>

                                <nameForm.Field name="lastName">
                                    {(field) => (
                                        <NUIFormField
                                            {...inputTraits.familyName}
                                            ref={lastNameRef}
                                            label={t('updating_personal_info.lastNameOptional')}
                                            error={fieldError(field, showErrors)}
                                            placeholder={t('updating_personal_info.enterLastName')}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChangeText={field.handleChange}
                                            onSubmitEditing={() => nameForm.handleSubmit()}
                                            maxLength={MAX_NAME_LENGTH}
                                            editable={!isUpsertingUser}
                                        />
                                    )}
                                </nameForm.Field>

                                <View style={styles.buttonRow}>
                                    <NUIButton
                                        variant="secondary"
                                        title={language === 'sw' ? 'Ghairi' : 'Cancel'}
                                        onPress={() => {
                                            setEditingSection(null);
                                            // Puts the stored values back and
                                            // clears the errors in one step.
                                            nameForm.reset({
                                                firstName: user?.kv?.first_name || '',
                                                lastName: user?.kv?.last_name || '',
                                            });
                                        }}
                                        disabled={isUpsertingUser}
                                        fullWidth={false}
                                        style={styles.rowButton}
                                    />
                                    <NUIButton
                                        title={language === 'sw' ? 'Hifadhi' : 'Save'}
                                        onPress={() => nameForm.handleSubmit()}
                                        loading={isUpsertingUser}
                                        fullWidth={false}
                                        style={styles.rowButton}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                {/* The saved name, read from the user record
                                    rather than the form: this is the display
                                    half of the toggle, so it should show what
                                    is stored, not what is being typed. */}
                                <Text style={styles.displayText}>
                                    {[user?.kv?.first_name, user?.kv?.last_name]
                                        .filter(Boolean)
                                        .join(' ')}
                                </Text>
                            </View>
                        )}
                    </NUICard>
                    <NUICard style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <Ionicons name="calendar" size={20} color="#FF597D" />
                                <Text style={styles.sectionTitle}>
                                    {language === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'}
                                </Text>
                            </View>
                            {editingSection !== 'dob' && (
                                <TouchableOpacity onPress={() => setEditingSection('dob')}>
                                    <Ionicons name="create-outline" size={20} color="#FF597D" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {editingSection === 'dob' ? (
                            <View style={styles.editContainer}>
                                {renderDateDisplay()}
                                {renderPicker()}

                                <View style={[styles.buttonRow, { marginTop: 20 }]}>
                                    <NUIButton
                                        variant="secondary"
                                        title={language === 'sw' ? 'Ghairi' : 'Cancel'}
                                        onPress={() => {
                                            setEditingSection(null);
                                            if (user?.kv?.date_of_birth) {
                                                const dob = new Date(user.kv.date_of_birth);
                                                setSelectedDay(dob.getDate());
                                                setSelectedMonth(dob.getMonth());
                                                setSelectedYear(dob.getFullYear());
                                            }
                                        }}
                                        disabled={isUpsertingUser}
                                        fullWidth={false}
                                        style={styles.rowButton}
                                    />
                                    <NUIButton
                                        title={language === 'sw' ? 'Hifadhi' : 'Save'}
                                        onPress={handleSaveDOB}
                                        loading={isUpsertingUser}
                                        fullWidth={false}
                                        style={styles.rowButton}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                <Text style={styles.displayText}>
                                    {selectedDay} {months[selectedMonth].label} {selectedYear}
                                </Text>
                            </View>
                        )}
                    </NUICard>
                    <Text style={styles.privacyText}>
                        {language === 'en'
                            ? "We know how much privacy matters to you. That's why we never share data without consent."
                            : 'Tujua jinsi faragha inavyokuwa muhimu kwako. Ndiyo maana hatutoi data bila idhini.'}
                    </Text>
                    <TouchableOpacity>
                        <Text
                            style={styles.privacyLink}
                            onPress={() => Linking.openURL('https://sikuzangu.org/privacy-policy')}
                        >
                            {t('updating_personal_info.privacyPolicy')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.app,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
      ...typography.body,
        marginTop: layout.sectionGap,
        color: colors.text.secondary,
    },
    scrollContent: {
        padding: layout.screenGutter,
        paddingBottom: PAGE_BOTTOM_PADDING,
    },
    section: {
        marginBottom: layout.sectionGap,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm + 4,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sectionTitle: {
      ...typography.body,
        fontWeight: '600',
        color: colors.text.primary,
    },
    displayContainer: {
        paddingVertical: spacing.sm,
    },
    displayText: {
      ...typography.body,
        color: colors.text.primary,
        fontWeight: '500',
    },
    editContainer: {
        marginTop: spacing.sm,
        gap: layout.fieldGap,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.sm + 4,
        marginTop: layout.sectionGap,
    },
    rowButton: {
        // Layout only — the two buttons share a row.
        flex: 1,
    },
    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        borderRadius: radius.sm + 4,
        padding: spacing.sm,
        marginBottom: layout.sectionGap,
    },
    dateSegment: {
        alignItems: 'center',
        padding: spacing.sm + 4,
        borderRadius: radius.sm + 4,
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
        marginTop: spacing.sm,
    },
    activeDateSegmentLabel: {
        color: colors.text.inverse,
        opacity: 0.9,
    },
    dateSeparator: {
        paddingHorizontal: spacing.xs,
    },
    dateSeparatorText: {
      ...typography.heading,
        fontWeight: '400',
        color: colors.text.muted,
    },
    pickerContainer: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.sm + 4,
        padding: spacing.sm + 4,
        maxHeight: 200,
    },
    pickerItem: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.sm + 4,
        alignItems: 'center',
        borderRadius: radius.sm,
        marginBottom: spacing.xs,
    },
    selectedPickerItem: {
        backgroundColor: colors.surface.tint,
    },
    pickerItemText: {
      ...typography.caption,
        color: colors.text.secondary,
    },
    selectedPickerItemText: {
      ...typography.caption,
        fontWeight: '600',
        color: colors.brand.text,
    },
    monthPickerItemText: {
      ...typography.caption,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    selectedMonthPickerItemText: {
      ...typography.caption,
        fontWeight: '600',
        color: colors.brand.text,
    },
    privacyText: {
      ...typography.label,
        marginTop: spacing.lg,
        fontWeight: '400',
        color: colors.text.secondary,
        textAlign: 'center',
    },
    privacyLink: {
      ...typography.label,
        color: colors.brand.text,
        fontWeight: '600',
        textAlign: 'center',
        marginVertical: spacing.sm,
        textDecorationLine: 'underline',
    },
});