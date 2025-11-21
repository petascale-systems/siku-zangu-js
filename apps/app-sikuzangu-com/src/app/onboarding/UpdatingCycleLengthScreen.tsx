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

export default function UpdatingCycleLengthScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language = (params.lang as 'en' | 'sw') ?? 'en';
    const userId = params.userId as string;
    const {upsertUser, isUpsertingUser} = useUser(userId);

    const [selectedLength, setSelectedLength] = useState<number>(28);
    const cycleLengths = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

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
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                language === 'en'
                    ? 'User ID not available'
                    : 'Kitambulisho cha mtumiaji hakipatikani'
            );
            return;
        }

        try {
            const updateData: User = {
                kv: {
                    avg_cycle_length_days: selectedLength,
                },
            };

            console.log('UpdatingCycleLength: Calling upsertUser with:', {
                userId,
                updateData,
            });

            await upsertUser(updateData);

            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en'
                    ? 'Cycle length saved successfully!'
                    : 'Muda wa mzunguko umehifadhiwa kwa mafanikio!',
                [
                    {
                        text: language === 'en' ? 'OK' : 'Sawa',

                        onPress: () =>
                            router.replace({
                                pathname: '/onboarding/UpdatingSymptomsMoodsScreen',
                                params: {
                                    lang: language,
                                    userId: userId,
                                },
                            }),
                    },
                ]
            );
        } catch (e: any) {
            const errorMessage = e.message || (language === 'en'
                ? 'Failed to save cycle length'
                : 'Imeshindwa kuhifadhi muda wa mzunguko');
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                errorMessage
            );
        }
    };

    const getFertileWindow = (length: number) => {
        const ovulationDay = length - 14;
        const fertileStart = Math.max(1, ovulationDay - 2);
        const fertileEnd = ovulationDay + 2;
        return {fertileStart, fertileEnd};
    };

    const renderCycleIndicator = (length: number) => {
        const isSelected = selectedLength === length;
        const {fertileStart, fertileEnd} = getFertileWindow(length);

        const dots = Array.from({length}, (_, i) => {
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

        return (
            <View style={styles.cycleIndicator}>
                {dots}
            </View>
        );
    };

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
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {language === 'en'
                            ? "What's your average cycle length?"
                            : 'Mzunguko wako wa wastani hudumu siku ngapi?'}
                    </Text>

                    <Text style={styles.subtitle}>
                        {language === 'en'
                            ? 'A cycle starts on day 1 of your period and ends before the next one.'
                            : 'Mzunguko huanza siku ya kwanza ya hedhi yako na kuisha kabla ya ijayo.'}
                    </Text>
                </View>

                <View style={styles.visualIndicator}>
                    <View style={styles.cycleInfoContainer}>
                        <Ionicons name="calendar-outline" size={20} color="#FD5A7E"/>
                        <Text style={styles.cycleInfoText}>
                            {language === 'en' ? 'Fertile window' : 'Dirisha la uzazi'}
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
                            const {fertileStart, fertileEnd} = getFertileWindow(length);
                            return (
                                <TouchableOpacity
                                    key={length}
                                    style={[
                                        styles.lengthCard,
                                        selectedLength === length && styles.lengthCardSelected,
                                    ]}
                                    onPress={() => setSelectedLength(length)}
                                    accessibilityLabel={`${length} ${language === 'en' ? 'days' : 'siku'}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{selected: selectedLength === length}}
                                >
                                    {renderCycleIndicator(length)}

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
                                            {language === 'en' ? 'DAYS' : 'SIKU'}
                                        </Text>
                                    </View>

                                    <Text style={styles.fertileWindowText}>
                                        {language === 'en' ? 'Day' : 'Siku'} {fertileStart}-{fertileEnd}
                                    </Text>

                                    {selectedLength === length && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color="#FD5A7E"/>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="information-circle-outline" size={20} color="#645F5F"/>
                    </View>
                    <Text style={styles.infoText}>
                        {language === 'en'
                            ? 'You can change your answer on your profile any time.'
                            : 'Unaweza kubadilisha jibu lako kwenye wasifu wako wakati wowote.'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, isUpsertingUser && styles.nextButtonDisabled]}
                    onPress={handleSave}
                    disabled={isUpsertingUser}
                    accessibilityLabel={language === 'en' ? 'Next' : 'Ijayo'}
                >
                    {isUpsertingUser ? (
                        <ActivityIndicator size="small" color="#fff"/>
                    ) : (
                        <Text style={styles.nextButtonText}>{language === 'en' ? 'NEXT' : 'IJAYO'}</Text>
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
        fontFamily: "Inter",
        fontStyle: "normal",
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 51,
        color: "#333333"
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Inter",
        fontStyle: "normal",
        fontWeight: '400',
        textAlign: 'center',
        color: '#645F5F',
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
        backgroundColor: '#FFE1E6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cycleInfoText: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '500',
        color: '#FD5A7E',
        marginLeft: 6,
    },
    lengthContainer: {
        marginBottom: 30,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    lengthCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 8,
        alignItems: 'center',
        minWidth: 120,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    lengthCardSelected: {
        backgroundColor: '#FFF5F2',
        borderColor: '#FD5A7E',
        shadowColor: '#FD5A7E',
        shadowOpacity: 0.2,
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
        backgroundColor: '#FD5A7E',
    },
    cycleDotFertileSelected: {
        backgroundColor: '#FD5A7E',
    },
    lengthContent: {
        alignItems: 'center',
    },
    lengthNumber: {
        fontSize: 32,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '700',
        color: '#CCCCCC',
        marginBottom: 4,
    },
    lengthNumberSelected: {
        color: '#FD5A7E',
    },
    lengthLabel: {
        fontSize: 12,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '600',
        color: '#999999',
        textTransform: 'uppercase',
    },
    lengthLabelSelected: {
        color: '#B59EF3',
    },
    fertileWindowText: {
        fontSize: 11,
        fontFamily: 'Inter',
        fontWeight: '500',
        color: '#999999',
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
        backgroundColor: '#F8F8F8',
        padding: 16,
        borderRadius: 16,
        marginBottom: 30,
        marginTop: 40,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '400',
        color: '#645F5F',
        lineHeight: 20,
    },
    nextButton: {
        backgroundColor: '#FD5A7E',
        fontFamily: "Inter",
        fontStyle: "normal",
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
        fontStyle: "normal",
    },
});