import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react';
import {UserKv} from '@siku-zangu/core';
import {NavbarCard} from '@siku-zangu/react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router';


export default function LogEntry() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language = (params.lang as 'en' | 'sw') ?? 'en';
    const userId = params.userId as string;
    const {upsertUser, isUpsertingUser, user, refetchUser} = useUser(userId);

    const symptoms = [
        {
            key: 'cramps',
            label: language === 'en' ? 'Cramps' : 'Maumivu ya Tumbo',
            icon: 'fitness-outline',
            color: '#F59E0B',
        },
        {
            key: 'fatigue',
            label: language === 'en' ? 'Fatigue' : 'Uchovu',
            icon: 'flash-outline',
            color: '#8B5CF6',
        },
        {
            key: 'bloating',
            label: language === 'en' ? 'Bloating' : 'Kuvimba',
            icon: 'water-outline',
            color: '#3B82F6',
        },
        {
            key: 'tender_breast',
            label: language === 'en' ? 'Tender Breasts' : 'Matiti Yanayouma',
            icon: 'female-outline',
            color: '#EC4899',
        },
        {
            key: 'backache',
            label: language === 'en' ? 'Backache' : 'Maumivu ya Mgongo',
            icon: 'body-outline',
            color: '#EF4444',
        },
        {
            key: 'headache',
            label: language === 'en' ? 'Headache' : 'Maumivu ya Kichwa',
            icon: 'medkit-outline',
            color: '#10B981',
        },
    ];

    const moods = [
        {key: 'happy', label: language === 'en' ? 'Happy' : 'Furaha', emoji: '😊', color: '#FFF9C4'},
        {key: 'sad', label: language === 'en' ? 'Sad' : 'Huzuni', emoji: '😢', color: '#E1F5FE'},
        {key: 'tired', label: language === 'en' ? 'Tired' : 'Kuchoka', emoji: '😴', color: '#F3E5F5'},
        {key: 'in_love', label: language === 'en' ? 'In Love' : 'Mapenzi', emoji: '😍', color: '#FCE4EC'},
        {key: 'calm', label: language === 'en' ? 'Calm' : 'Utulivu', emoji: '😌', color: '#E8F5E9'},
        {key: 'curious', label: language === 'en' ? 'Curious' : 'Udadisi', emoji: '🤔', color: '#FFF3E0'},
    ];

    const medications = [
        {key: 'pain_relief', label: language === 'en' ? 'Pain Relief' : 'Dawa ya maumivu', icon: '💊', color: '#FFEBEE'},
        {
            key: 'herbal_supplement',
            label: language === 'en' ? 'Herbal Supplement' : 'Virutubisho',
            icon: '🌿',
            color: '#E8F5E9'
        },
        {
            key: 'hormone_therapy',
            label: language === 'en' ? 'Hormone Therapy' : 'Tiba ya homoni',
            icon: '💉',
            color: '#E1F5FE'
        },
        {
            key: 'birth_control',
            label: language === 'en' ? 'Birth Control' : 'Kupunguza uzazi',
            icon: '💊',
            color: '#F3E5F5'
        },
    ];

    const months = language === 'en'
        ? [
            {value: 0, label: 'Jan'}, {value: 1, label: 'Feb'}, {value: 2, label: 'Mar'},
            {value: 3, label: 'Apr'}, {value: 4, label: 'May'}, {value: 5, label: 'Jun'},
            {value: 6, label: 'Jul'}, {value: 7, label: 'Aug'}, {value: 8, label: 'Sep'},
            {value: 9, label: 'Oct'}, {value: 10, label: 'Nov'}, {value: 11, label: 'Dec'}
        ]
        : [
            {value: 0, label: 'Jan'}, {value: 1, label: 'Feb'}, {value: 2, label: 'Mac'},
            {value: 3, label: 'Apr'}, {value: 4, label: 'Mei'}, {value: 5, label: 'Jun'},
            {value: 6, label: 'Jul'}, {value: 7, label: 'Ago'}, {value: 8, label: 'Sep'},
            {value: 9, label: 'Okt'}, {value: 10, label: 'Nov'}, {value: 11, label: 'Des'}
        ];

    const [initialLastPeriodDays, setInitialLastPeriodDays] = useState<number | null>(null);
    const [initialAvgCycleDays, setInitialAvgCycleDays] = useState<number | null>(null);
    const [initialDay, setInitialDay] = useState<number | null>(null);
    const [initialMonth, setInitialMonth] = useState<number | null>(null);
    const [initialYear, setInitialYear] = useState<number | null>(null);

    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

    const [lastPeriodDays, setLastPeriodDays] = useState<number | null>(null);
    const [avgCycleDays, setAvgCycleDays] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useFocusEffect(
        useCallback(() => {
            if (userId && refetchUser) {
                refetchUser();
            }
        }, [userId, refetchUser])
    );

    useEffect(() => {
        if (!user?.kv) return;
        const periodDays = user.kv.avg_period_length_days ?? null;
        const cycleDays = user.kv.avg_cycle_length_days ?? null;

        setLastPeriodDays(periodDays);
        setAvgCycleDays(cycleDays);
        setInitialLastPeriodDays(periodDays);
        setInitialAvgCycleDays(cycleDays);

        if (user.kv.prev_cycle_start_date) {
            const d = new Date(user.kv.prev_cycle_start_date);
            const day = d.getDate();
            const month = d.getMonth();
            const year = d.getFullYear();

            setSelectedDay(day);
            setSelectedMonth(month);
            setSelectedYear(year);
            setInitialDay(day);
            setInitialMonth(month);
            setInitialYear(year);
        }

        setSelectedSymptoms([]);
        setSelectedMoods([]);
        setSelectedMedications([]);
    }, [user]);

    const getDaysInMonth = (month: number | null, year: number | null) => {
        if (month === null || !year) return 31;
        return new Date(year, month + 1, 0).getDate();
    };

    const days = Array.from(
        {length: getDaysInMonth(selectedMonth, selectedYear)},
        (_, i) => i + 1
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 3}, (_, i) => currentYear - 1 + i);

    useEffect(() => {
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

    const toggleSelection = (list: string[], setList: (v: string[]) => void, key: string) => {
        if (list.includes(key)) {
            setList(list.filter((item) => item !== key));
        } else {
            setList([...list, key]);
        }
    };

    const onDateChange = (type: 'day' | 'month' | 'year', value: number) => {
        if (type === 'day') setSelectedDay(value);
        if (type === 'month') setSelectedMonth(value);
        if (type === 'year') setSelectedYear(value);
    };

    const formatDateToISO = (day: number | null, month: number | null, year: number | null): string => {
        if (!day || month === null || !year) return '';
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    };

    const isValidDate = (day: number | null, month: number | null, year: number | null): boolean => {
        if (!day || month === null || !year) return false;
        const date = new Date(year, month, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day
        );
    };

    const renderPicker = (
        label: string,
        options: number[],
        selectedValue: number | null,
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
                                    isSelected && styles.pickerOptionSelected
                                ]}
                                onPress={() => onSelect(option)}
                            >
                                <Text style={[
                                    styles.pickerOptionText,
                                    isSelected && styles.pickerOptionTextSelected
                                ]}>
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
        if (!lastPeriodDays) {
            Alert.alert(
                language === 'en' ? 'Missing Information' : 'Taarifa Zinazokosekana',
                language === 'en'
                    ? 'Please select how long your last period lasted.'
                    : 'Tafadhali chagua muda gani hedhi yako ya mwisho ilidumu.'
            );
            return;
        }

        if (!avgCycleDays) {
            Alert.alert(
                language === 'en' ? 'Missing Information' : 'Taarifa Zinazokosekana',
                language === 'en'
                    ? 'Please select your average menstrual cycle length.'
                    : 'Tafadhali chagua urefu wa wastani wa mzunguko wako wa hedhi.'
            );
            return;
        }

        if (!selectedDay || selectedMonth === null || !selectedYear) {
            Alert.alert(
                language === 'en' ? 'Invalid Date' : 'Tarehe si Sahihi',
                language === 'en'
                    ? 'Please select a complete date for your last period start.'
                    : 'Tafadhali chagua tarehe kamili ya kuanza kwa hedhi yako ya mwisho.'
            );
            return;
        }

        if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
            Alert.alert(
                language === 'en' ? 'Invalid Date' : 'Tarehe si Sahihi',
                language === 'en'
                    ? 'Please select a valid date.'
                    : 'Tafadhali chagua tarehe sahihi.'
            );
            return;
        }

        const updates: UserKv = {};
        if (selectedSymptoms.length > 0) {
            const existingLogs = user?.kv?.symptom_logs || [];
            const newLogs = selectedSymptoms.map(symptom => ({
                symptom,
                timestamp: new Date().toISOString()
            }));
            updates.symptom_logs = [...existingLogs, ...newLogs];
        }
        if (selectedMoods.length > 0) {
            const existingLogs = user?.kv?.mood_logs || [];
            const newLogs = selectedMoods.map(mood => ({
                mood,
                timestamp: new Date().toISOString()
            }));
            updates.mood_logs = [...existingLogs, ...newLogs];
        }
        if (selectedMedications.length > 0) {
            const existingLogs = user?.kv?.medication_logs || [];
            const newLogs = selectedMedications.map(medication => ({
                medication,
                timestamp: new Date().toISOString()
            }));
            updates.medication_logs = [...existingLogs, ...newLogs];
        }
        if (lastPeriodDays !== initialLastPeriodDays) {
            updates.avg_period_length_days = lastPeriodDays;
        }
        if (avgCycleDays !== initialAvgCycleDays) {
            updates.avg_cycle_length_days = avgCycleDays;
        }
        const newDateStr = formatDateToISO(selectedDay, selectedMonth, selectedYear);
        const initialDateStr = formatDateToISO(initialDay, initialMonth, initialYear);
        if (newDateStr !== initialDateStr) {
            updates.prev_cycle_start_date = newDateStr;
        }

        if (Object.keys(updates).length === 0) {
            Alert.alert(
                language === 'en' ? 'No Changes' : 'Hakuna Mabadiliko',
                language === 'en'
                    ? 'No changes to save.'
                    : 'Hakuna mabadiliko ya kuhifadhi.'
            );
            return;
        }

        try {
            await upsertUser({kv: updates});

            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en' ? 'Log saved successfully!' : 'Rekodi imehifadhiwa!',
                [{text: 'OK'}]
            );

            setSelectedSymptoms([]);
            setSelectedMoods([]);
            setSelectedMedications([]);
            if (updates.avg_period_length_days !== undefined) {
                setInitialLastPeriodDays(lastPeriodDays);
            }
            if (updates.avg_cycle_length_days !== undefined) {
                setInitialAvgCycleDays(avgCycleDays);
            }
            if (updates.prev_cycle_start_date) {
                setInitialDay(selectedDay);
                setInitialMonth(selectedMonth);
                setInitialYear(selectedYear);
            }
            if (refetchUser) {
                await refetchUser();
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save');
        }
    };

    const handleBack = () => router.back();

    return (
        <View style={[styles.container, {paddingTop: insets.top}]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="#000"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === 'en' ? 'Log Entry' : 'Rekodi'}
                </Text>
                <View style={{width: 32}}/>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{translateY: slideAnim}],
                    }}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === 'en' ? 'Log your symptoms' : 'Rekodi dalili zako'}
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
                                        onPress={() =>
                                            toggleSelection(selectedSymptoms, setSelectedSymptoms, item.key)
                                        }
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={24}
                                            color={item.color}
                                        />
                                        <Text style={[styles.symptomLabel, isSelected && styles.symptomLabelSelected]}>
                                            {item.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.checkmark}>
                                                <Ionicons name="checkmark-circle" size={20} color="#FD5A7E"/>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === 'en' ? 'Cycle Details' : 'Maelezo ya Mzunguko'}
                        </Text>
                        <View style={styles.cycleDetailCard}>
                            <Text style={styles.cycleDetailLabel}>
                                {language === 'en'
                                    ? 'Last Period lasted for?'
                                    : 'Hedhi ya mwisho ilidumu kwa?'}
                            </Text>
                            <View style={styles.daysSelector}>
                                {[5, 6, 7, 8, 9].map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayCircle,
                                            lastPeriodDays === day && styles.dayCircleSelected,
                                        ]}
                                        onPress={() => setLastPeriodDays(day)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                lastPeriodDays === day && styles.dayTextSelected,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.cycleDetailCard}>
                            <Text style={styles.cycleDetailLabel}>
                                {language === 'en'
                                    ? 'My average menstrual cycle is?'
                                    : 'Mzunguko wangu wa wastani ni?'}
                            </Text>
                            <View style={styles.daysSelector}>
                                {[26, 27, 28, 29, 30].map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayCircle,
                                            avgCycleDays === day && styles.dayCircleSelected,
                                        ]}
                                        onPress={() => setAvgCycleDays(day)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                avgCycleDays === day && styles.dayTextSelected,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === 'en' ? 'Medication' : 'Dawa'}
                        </Text>
                        <View style={styles.medicationList}>
                            {medications.map((item) => {
                                const isSelected = selectedMedications.includes(item.key);
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.medicationCard,
                                            {backgroundColor: item.color},
                                            isSelected && styles.medicationCardSelected,
                                        ]}
                                        onPress={() =>
                                            toggleSelection(selectedMedications, setSelectedMedications, item.key)
                                        }
                                    >
                                        <Text style={styles.medicationIcon}>{item.icon}</Text>
                                        <Text style={styles.medicationLabel}>{item.label}</Text>
                                        {isSelected && (
                                            <View style={styles.medicationCheck}>
                                                <Ionicons name="checkmark-circle" size={18} color="#FD5A7E"/>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === 'en' ? 'Log your mood' : 'Rekodi hisia yako'}
                        </Text>
                        <View style={styles.moodsGrid}>
                            {moods.map((item) => {
                                const isSelected = selectedMoods.includes(item.key);
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.moodCard,
                                            {backgroundColor: item.color},
                                            isSelected && styles.moodCardSelected,
                                        ]}
                                        onPress={() =>
                                            toggleSelection(selectedMoods, setSelectedMoods, item.key)
                                        }
                                    >
                                        <Text style={styles.moodEmoji}>{item.emoji}</Text>
                                        <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === 'en' ? 'Start date of last period' : 'Tarehe ya kuanza kwa hedhi ya mwisho'}
                        </Text>
                        <View style={styles.datePreview}>
                            <Ionicons name="calendar-outline" size={18} color="#FF6B9D"/>
                            <Text style={styles.datePreviewText}>
                                {selectedDay && selectedMonth !== null && selectedYear
                                    ? `${selectedDay} ${months[selectedMonth].label} ${selectedYear}`
                                    : language === 'en' ? 'Select date' : 'Chagua tarehe'}
                            </Text>
                        </View>
                        <View style={styles.datePickerRow}>
                            {renderPicker(
                                language === 'en' ? 'Day' : 'Siku',
                                days,
                                selectedDay,
                                v => onDateChange('day', v)
                            )}
                            {renderPicker(
                                language === 'en' ? 'Month' : 'Mwezi',
                                Array.from({length: 12}, (_, i) => i),
                                selectedMonth,
                                v => onDateChange('month', v),
                                true
                            )}
                            {renderPicker(
                                language === 'en' ? 'Year' : 'Mwaka',
                                years,
                                selectedYear,
                                v => onDateChange('year', v)
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isUpsertingUser && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={isUpsertingUser}
                        accessibilityLabel={language === 'en' ? 'SAVE' : 'HIFADHI'}
                    >
                        {isUpsertingUser ? (
                            <ActivityIndicator size="small" color="#fff"/>
                        ) : (
                            <Text style={styles.saveButtonText}>
                                {language === 'en' ? 'SAVE' : 'HIFADHI'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <NavbarCard language={language} userId={userId}/>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Inter',
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
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        position: 'relative',
        backgroundColor: '#F6F0FF',
    },
    symptomCardSelected: {
        borderWidth: 2,
        borderColor: '#FD5A7E',
    },
    symptomIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    symptomLabel: {
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
    },
    symptomLabelSelected: {
        fontWeight: '600',
        color: '#FD5A7E',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    cycleDetailCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cycleDetailLabel: {
        fontSize: 14,
        color: '#645F5F',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '500',
        marginBottom: 12,
    },
    daysSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dayCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleSelected: {
        backgroundColor: '#FFD5E5',
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    dayTextSelected: {
        color: '#FD5A7E',
    },
    medicationList: {
        gap: 12,
    },
    medicationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        position: 'relative',
    },
    medicationCardSelected: {
        borderWidth: 2,
        borderColor: '#FD5A7E',
    },
    medicationIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    medicationLabel: {
        fontSize: 14,
        color: '#555',
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
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    moodCardSelected: {
        borderWidth: 2,
        borderColor: '#FD5A7E',
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
    },
    moodLabelSelected: {
        fontWeight: '600',
        color: '#FD5A7E',
    },
    datePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    datePreviewText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B9D',
    },
    datePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    pickerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        maxHeight: 200,
    },
    pickerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
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
        height: 40,
    },
    pickerOptionSelected: {
        backgroundColor: '#FFD5E5',
    },
    pickerOptionText: {
        fontSize: 14,
        color: '#666',
    },
    pickerOptionTextSelected: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FD5A7E',
    },
    saveButton: {
        backgroundColor: '#FD5A7E',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '600',
        paddingVertical: 15,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        backgroundColor: '#FFB6C1',
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        fontStyle: 'normal',
    },
});
