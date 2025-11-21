import React, {useRef, useState} from 'react';
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
import {Ionicons} from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react';
import {User} from '@siku-zangu/core';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';


const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function UpdatingDOBScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language = (params.lang as 'en' | 'sw') ?? 'en';
    const userId = params.userId as string;
    const {upsertUser, isUpsertingUser} = useUser(userId);

    const [selectedDay, setSelectedDay] = useState<number>(12);
    const [selectedMonth, setSelectedMonth] = useState<number>(8); // September (0-indexed)
    const [selectedYear, setSelectedYear] = useState<number>(2003);
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
        {label: language === 'en' ? 'March' : 'Machi', value: 2, short: 'Mar'},
        {label: language === 'en' ? 'April' : 'Aprili', value: 3, short: 'Apr'},
        {label: language === 'en' ? 'May' : 'Mei', value: 4, short: 'May'},
        {label: language === 'en' ? 'June' : 'Juni', value: 5, short: 'Jun'},
        {label: language === 'en' ? 'July' : 'Julai', value: 6, short: 'Jul'},
        {label: language === 'en' ? 'August' : 'Agosti', value: 7, short: 'Aug'},
        {
            label: language === 'en' ? 'September' : 'Septemba',
            value: 8,
            short: 'Sep',
        },
        {label: language === 'en' ? 'October' : 'Oktoba', value: 9, short: 'Oct'},
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
        {length: getDaysInMonth(selectedMonth, selectedYear)},
        (_, i) => i + 1
    );
    const years = Array.from({length: 50}, (_, i) => 1975 + i);

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

        try {
            const date_of_birth = formatDateToISO(
                selectedDay,
                selectedMonth,
                selectedYear
            );
            const updateData: User = {kv: {date_of_birth}};

            console.log('UpdatingDOB: Saving date:', date_of_birth);

            await upsertUser(updateData);

            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en'
                    ? 'Date of birth saved successfully!'
                    : 'Tarehe ya kuzaliwa imehifadhiwa!',
                [
                    {
                        text: language === 'en' ? 'OK' : 'Sawa',
                        onPress: () =>
                            router.replace({
                                pathname: '/onboarding/UpdatingPeriodScreen',
                                params: {
                                    lang: language,
                                    userId: userId,
                                },
                            }),
                    },
                ]
            );
        } catch (error: any) {
            const errorMessage =
                error.message ||
                (language === 'en'
                    ? 'Failed to save date of birth'
                    : 'Imeshindwa kuhifadhi tarehe ya kuzaliwa');
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
                <Text style={styles.dateSegmentLabel}>
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
                <Text style={styles.dateSegmentLabel}>
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
                <Text style={styles.dateSegmentLabel}>
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
                                selectedMonth === month.value && styles.selectedPickerItem,
                            ]}
                            onPress={() => setSelectedMonth(month.value)}
                        >
                            <Text
                                style={[
                                    styles.pickerItemText,
                                    selectedMonth === month.value &&
                                    styles.selectedPickerItemText,
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel={language === 'en' ? 'Go back' : 'Rudi nyuma'}
            >
                <Ionicons name="arrow-back" size={24} color="black"/>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{translateY: slideAnim}],
                    },
                ]}
            >
                <Text style={styles.title}>
                    {language === 'en' ? 'When were you born?' : 'Ulizaliwa lini?'}
                </Text>
                <Text style={styles.subtitle}>
                    {language === 'en'
                        ? 'Knowing your age helps us give you better tips.'
                        : 'Kujua umri wako hutusaidia kukupa ushauri bora.'}
                </Text>

                {renderDateDisplay()}
                {renderPicker()}

                <Text style={styles.termsText}>
                    {language === 'en' ? (
                        <>
                            Review our{' '}
                            <Text style={styles.termsConditions}>Terms and Conditions</Text>{' '}
                            to learn about the minimum age requirement. You can change your
                            answer on your profile any time.
                        </>
                    ) : (
                        <>
                            Angalia{' '}
                            <Text style={styles.termsConditions}>Sheria na Masharti</Text>{' '}
                            yetu kujua kuhusu umri wa chini unaohitajika. Unaweza kubadilisha
                            jibu lako wakati wowote katika profaili yako.
                        </>
                    )}
                </Text>

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
                        <ActivityIndicator size="small" color="#fff"/>
                    ) : (
                        <Text style={styles.nextButtonText}>
                            {language === 'en' ? 'NEXT' : 'IJAYO'}
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

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
        shadowOffset: {width: 0, height: 4},
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
        color: '#999999',
        marginTop: 10,
        fontFamily: 'Inter',
    },
    dateSeparator: {
        paddingHorizontal: 8,
    },
    dateSeparatorText: {
        fontSize: 20,
        fontWeight: '300',
        color: '#CCCCCC',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        height: 200,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 12,
        elevation: 5,
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
    termsText: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '400',
        color: '#645F5F',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 18,
    },
    termsConditions: {
        color: '#E66386',
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#FD5A7E',
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '600',
        paddingVertical: 15,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 30,
    },
    nextButtonDisabled: {
        backgroundColor: '#FFB6C1',
        opacity: 0.6,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        fontStyle: 'normal',
    },
});
