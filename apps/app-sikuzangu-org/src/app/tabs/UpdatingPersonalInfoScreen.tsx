import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react-native';
import { User } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type EditSection = 'name' | 'dob' | null;

const currentYear = new Date().getFullYear();
const maxBirthYear = currentYear;
const minBirthYear = 1975;

export default function UpdatePersonalInfoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const language = (params.lang as 'en' | 'sw') ?? 'en';
    const userId = params.userId as string;
    const { user, upsertUser, isUpsertingUser, isFetchingUser, isInitialFetching, isBackgroundFetching } = useUser(userId);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');

    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(
        Math.min(2000, maxBirthYear)
    );
    const [activePicker, setActivePicker] = useState<'day' | 'month' | 'year'>('day');

    const [editingSection, setEditingSection] = useState<EditSection>(null);
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    useEffect(() => {
        if (user && !isFetchingUser) {
            setFirstName(user.kv?.first_name || '');
            setLastName(user.kv?.last_name || '');

            if (user.kv?.date_of_birth) {
                const dob = new Date(user.kv.date_of_birth);
                setSelectedDay(dob.getDate());
                setSelectedMonth(dob.getMonth());
                setSelectedYear(dob.getFullYear());
            }
        }
    }, [user, isFetchingUser]);

    const months = [
        { label: language === 'en' ? 'January' : 'Januari', value: 0, short: 'Jan' },
        { label: language === 'en' ? 'February' : 'Februari', value: 1, short: 'Feb' },
        { label: language === 'en' ? 'March' : 'Machi', value: 2, short: 'Mar' },
        { label: language === 'en' ? 'April' : 'Aprili', value: 3, short: 'Apr' },
        { label: language === 'en' ? 'May' : 'Mei', value: 4, short: 'May' },
        { label: language === 'en' ? 'June' : 'Juni', value: 5, short: 'Jun' },
        { label: language === 'en' ? 'July' : 'Julai', value: 6, short: 'Jul' },
        { label: language === 'en' ? 'August' : 'Agosti', value: 7, short: 'Aug' },
        { label: language === 'en' ? 'September' : 'Septemba', value: 8, short: 'Sep' },
        { label: language === 'en' ? 'October' : 'Oktoba', value: 9, short: 'Oct' },
        { label: language === 'en' ? 'November' : 'Novemba', value: 10, short: 'Nov' },
        { label: language === 'en' ? 'December' : 'Desemba', value: 11, short: 'Dec' },
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

    const validateName = (name: string, field: 'first' | 'last'): string => {
        if (field === 'first' && name.length === 0) {
            return language === 'en'
                ? 'First name is required'
                : 'Jina la kwanza linahitajika';
        }
        if (name.length > 50) {
            return language === 'en'
                ? `${field === 'first' ? 'First' : 'Last'} name must be at most 50 characters`
                : `${field === 'first' ? 'Jina la kwanza' : 'Jina la mwisho'} linapaswa kuwa hadi herufi 50`;
        }
        return '';
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
        if (hasAttemptedSave) {
            setFirstNameError(validateName(text, 'first'));
        }
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
        if (hasAttemptedSave) {
            setLastNameError(validateName(text, 'last'));
        }
    };

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

    const handleSaveName = async () => {
        setHasAttemptedSave(true);
        const firstError = validateName(firstName.trim(), 'first');
        const lastError = validateName(lastName.trim(), 'last');
        setFirstNameError(firstError);
        setLastNameError(lastError);
        if (firstError || lastError) {
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                language === 'en'
                    ? 'Please fix errors before saving'
                    : 'Tafadhali sahihisha makosa kabla ya kuhifadhi'
            );
            return;
        }
        try {
            const updateData: User = {
                kv: {
                    first_name: firstName.trim(),
                },
            };
            if (lastName.trim()) {
                updateData.kv!.last_name = lastName.trim();
            }
            await upsertUser(updateData);
            setEditingSection(null);
            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en' ? 'Name updated successfully!' : 'Jina limesasishwa!'
            );
        } catch (e: any) {
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                e.message || (language === 'en' ? 'Failed to update name' : 'Imeshindwa kusasisha jina')
            );
        }
    };

    const handleSaveDOB = async () => {
        if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
            Alert.alert(
                language === 'en' ? 'Invalid Date' : 'Tarehe si sahihi',
                language === 'en' ? 'Please select a valid date' : 'Tafadhali chagua tarehe sahihi'
            );
            return;
        }

        try {
            const date_of_birth = formatDateToISO(selectedDay, selectedMonth, selectedYear);
            const updateData: User = { kv: { date_of_birth } };
            await upsertUser(updateData);
            setEditingSection(null);
            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en'
                    ? 'Date of birth updated successfully!'
                    : 'Tarehe ya kuzaliwa imesasishwa!'
            );
        } catch (error: any) {
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                error.message ||
                (language === 'en'
                    ? 'Failed to save date of birth'
                    : 'Imeshindwa kuhifadhi tarehe ya kuzaliwa')
            );
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
                style={{ maxHeight: 150 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
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

    if (isInitialFetching && !user) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#FF5C8D" />
                <Text style={styles.loadingText}>
                    {language === 'sw' ? 'Inapakia...' : 'Loading...'}
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {isBackgroundFetching && (
                <View style={{ position: 'absolute', top: insets.top + 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
                    <ActivityIndicator size="small" color="#FF5C8D" />
                </View>
            )}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === 'sw' ? 'Sasisha Taarifa Binafsi' : 'Update Personal Info'}
                </Text>
                <View style={{ width: 32 }} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                <View>
                    <View style={styles.section}>
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
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>
                                        {language === 'en' ? 'First name (required)' : 'Jina la kwanza (lazima)'}
                                    </Text>
                                    <TextInput
                                        style={[styles.input, firstNameError ? styles.errorBorder : null]}
                                        value={firstName}
                                        onChangeText={handleFirstNameChange}
                                        placeholder={language === 'en' ? 'Enter first name' : 'Ingiza jina la kwanza'}
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                        editable={!isUpsertingUser}
                                    />
                                    {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>
                                        {language === 'en' ? 'Last name (optional)' : 'Jina la mwisho (si lazima)'}
                                    </Text>
                                    <TextInput
                                        style={[styles.input, lastNameError ? styles.errorBorder : null]}
                                        value={lastName}
                                        onChangeText={handleLastNameChange}
                                        placeholder={language === 'en' ? 'Enter last name' : 'Ingiza jina la mwisho'}
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                        editable={!isUpsertingUser}
                                    />
                                    {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setEditingSection(null);
                                            setFirstName(user?.kv?.first_name || '');
                                            setLastName(user?.kv?.last_name || '');
                                            setFirstNameError('');
                                            setLastNameError('');
                                        }}
                                        disabled={isUpsertingUser}
                                    >
                                        <Text style={styles.cancelButtonText}>
                                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveButton, isUpsertingUser && styles.saveButtonDisabled]}
                                        onPress={handleSaveName}
                                        disabled={isUpsertingUser}
                                    >
                                        {isUpsertingUser ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>
                                                {language === 'sw' ? 'Hifadhi' : 'Save'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                <Text style={styles.displayText}>
                                    {firstName} {lastName}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.section}>
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
                                    <TouchableOpacity
                                        style={styles.cancelButton}
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
                                    >
                                        <Text style={styles.cancelButtonText}>
                                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveButton, isUpsertingUser && styles.saveButtonDisabled]}
                                        onPress={handleSaveDOB}
                                        disabled={isUpsertingUser}
                                    >
                                        {isUpsertingUser ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>
                                                {language === 'sw' ? 'Hifadhi' : 'Save'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                <Text style={styles.displayText}>
                                    {selectedDay} {months[selectedMonth].label} {selectedYear}
                                </Text>
                            </View>
                        )}
                    </View>
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
                            {language === 'en' ? 'Privacy Policy' : 'Sera ya Faragha'}
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
        backgroundColor: '#FFF5F2',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backButton: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FD5A7E',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF597D',
        fontFamily: 'Inter',
    },
    displayContainer: {
        paddingVertical: 8,
    },
    displayText: {
        fontSize: 16,
        color: '#333333',
        fontFamily: 'Inter',
        fontWeight: '500',
    },
    editContainer: {
        marginTop: 8,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        fontFamily: 'Inter',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#f4a5a5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        fontFamily: 'Inter',
    },
    errorBorder: {
        borderColor: '#E66386',
        borderWidth: 2,
    },
    errorText: {
        color: '#E66386',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'Inter',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF597D',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FF597D',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#FF597D',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
        marginBottom: 20,
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
        paddingHorizontal: 4,
    },
    dateSeparatorText: {
        fontSize: 20,
        fontWeight: '300',
        color: '#CCCCCC',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        maxHeight: 200,
    },
    pickerScrollContent: {
        maxHeight: 150,
    },
    pickerItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 4,
    },
    selectedPickerItem: {
        backgroundColor: '#FFD5E5',
    },
    pickerItemText: {
        fontSize: 14,
        color: '#666',
    },
    selectedPickerItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FD5A7E',
    },
    monthPickerItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedMonthPickerItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FD5A7E',
    },
    privacyText: {
        fontSize: 12,
        marginTop: 24,
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#645F5F',
        textAlign: 'center',
        lineHeight: 18,
    },
    privacyLink: {
        color: '#E66386',
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 10,
        textDecorationLine: 'underline',
    },
});