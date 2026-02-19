import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@siku-zangu/react';

type Lang = 'en' | 'sw';

const t = {
    en: {
        headerTitle: 'Set New PIN',
        subtitle: "Choose a new 4-digit PIN for your account. Make sure it's memorable but hard to guess.",
        newPinLabel: 'NEW PIN',
        confirmPinLabel: 'CONFIRM NEW PIN',
        placeholder: '****',
        save: 'SAVE NEW PIN',
        errorTitle: 'Error',
        errorInvalid: 'PIN must be exactly 4 digits.',
        errorNoMatch: 'PINs do not match.',
        errorWeak: 'Please choose a PIN that is not easy to guess.',
        errorGeneric: 'Failed to reset PIN. Please try again.',
        successTitle: 'Success',
        successMsg: 'Your PIN has been reset! Please log in with your new PIN.',
        ok: 'OK',
        tipsTitle: 'Security Tips:',
        tips: [
            'Use a PIN you can remember but others cannot guess',
            'Avoid simple PINs like 1234 or 0000',
            'Never share your PIN with anyone',
            'Change your PIN regularly for added security',
        ],
    },
    sw: {
        headerTitle: 'Weka PIN Mpya',
        subtitle: 'Chagua PIN mpya ya tarakimu 4 kwa akaunti yako. Hakikisha inakumbukwa lakini haiwezi kukisiwa.',
        newPinLabel: 'PIN MPYA',
        confirmPinLabel: 'THIBITISHA PIN MPYA',
        placeholder: '****',
        save: 'HIFADHI PIN MPYA',
        errorTitle: 'Hitilafu',
        errorInvalid: 'PIN lazima iwe na tarakimu 4 haswa.',
        errorNoMatch: 'PIN hazilingani.',
        errorWeak: 'Tafadhali chagua PIN ambayo haiwezi kukisiwa rahisi.',
        errorGeneric: 'Imeshindwa kubadilisha PIN. Tafadhali jaribu tena.',
        successTitle: 'Mafanikio',
        successMsg: 'PIN yako imebadilishwa! Tafadhali ingia kwa kutumia PIN yako mpya.',
        ok: 'Sawa',
        tipsTitle: 'Vidokezo vya Usalama:',
        tips: [
            'Tumia PIN ambayo huwezi kusahau lakini haiwezi kukisiwa',
            'Epuka PIN rahisi kama 1234 au 0000',
            'Usimshirikishe mtu yeyote PIN yako',
            'Badilisha PIN yako mara kwa mara kwa usalama zaidi',
        ],
    },
};

const WEAK_PINS = [
    '0000', '1111', '2222', '3333', '4444',
    '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1122', '2211',
];

export default function ResetPinScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language: Lang = (params.lang as Lang) ?? 'en';
    const storagePhone = params.storagePhone as string;
    const resetToken = params.resetToken as string;
    const tx = t[language];

    const { submitNewPin, isResettingPin } = useUser();

    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        if (!/^\d{4}$/.test(newPin)) {
            Alert.alert(tx.errorTitle, tx.errorInvalid);
            return;
        }
        if (newPin !== confirmPin) {
            Alert.alert(tx.errorTitle, tx.errorNoMatch);
            return;
        }
        if (WEAK_PINS.includes(newPin)) {
            Alert.alert(tx.errorTitle, tx.errorWeak);
            return;
        }

        try {
            await submitNewPin(storagePhone, resetToken, newPin);
            Alert.alert(tx.successTitle, tx.successMsg, [
                {
                    text: tx.ok,
                    onPress: () =>
                        router.replace({
                            pathname: '/auth/LoginScreen',
                            params: { lang: language },
                        }),
                },
            ]);
        } catch (e: any) {
            Alert.alert(tx.errorTitle, e?.message ?? tx.errorGeneric);
        }
    };

    const pinMatchState =
        confirmPin.length === 4
            ? confirmPin === newPin
                ? 'match'
                : 'mismatch'
            : 'neutral';

    const isDisabled = isResettingPin || !newPin || !confirmPin;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{tx.headerTitle}</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Icon */}
                <View style={styles.iconCircle}>
                    <Ionicons name="key-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                {/* Form */}
                <View style={styles.form}>
                    {/* New PIN */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{tx.newPinLabel}</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={newPin}
                                onChangeText={(text) => {
                                    if (/^\d*$/.test(text)) setNewPin(text);
                                }}
                                placeholder={tx.placeholder}
                                placeholderTextColor="#BBBBBB"
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry={!showNew}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowNew(!showNew)}
                            >
                                <Ionicons
                                    name={showNew ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Progress dots */}
                        <View style={styles.dotsRow}>
                            {Array(4).fill(null).map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.dot, i < newPin.length && styles.dotFilled]}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Confirm PIN */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{tx.confirmPinLabel}</Text>
                        <View style={[
                            styles.inputContainer,
                            pinMatchState === 'mismatch' && styles.inputError,
                            pinMatchState === 'match'    && styles.inputSuccess,
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={confirmPin}
                                onChangeText={(text) => {
                                    if (/^\d*$/.test(text)) setConfirmPin(text);
                                }}
                                placeholder={tx.placeholder}
                                placeholderTextColor="#BBBBBB"
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirm(!showConfirm)}
                            >
                                <Ionicons
                                    name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#999"
                                />
                            </TouchableOpacity>
                            {pinMatchState !== 'neutral' && (
                                <Ionicons
                                    name={pinMatchState === 'match' ? 'checkmark-circle' : 'close-circle'}
                                    size={20}
                                    color={pinMatchState === 'match' ? '#10B981' : '#E66386'}
                                    style={{ marginRight: 4 }}
                                />
                            )}
                        </View>
                    </View>
                </View>

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveButton, isDisabled && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isDisabled}
                    activeOpacity={0.8}
                >
                    {isResettingPin ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>{tx.save}</Text>
                    )}
                </TouchableOpacity>

                {/* Security tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>{tx.tipsTitle}</Text>
                    {tx.tips.map((tip, i) => (
                        <View key={i} style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { padding: 6 },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
        textAlign: 'center',
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#FFE8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 20,
        shadowColor: '#E66386',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#645F5F',
        lineHeight: 22,
        marginBottom: 28,
        textAlign: 'center',
    },
    form: {
        gap: 24,
        marginBottom: 28,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputGroup: { gap: 8 },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#645F5F',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    inputError: {
        borderColor: '#E66386',
        backgroundColor: '#FFF5F8',
    },
    inputSuccess: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    input: {
        flex: 1,
        fontSize: 24,
        color: '#333',
        paddingVertical: 14,
        letterSpacing: 8,
    },
    eyeButton: { padding: 8 },
    dotsRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFB6C1',
    },
    dotFilled: { backgroundColor: '#E66386' },
    saveButton: {
        backgroundColor: '#FF597D',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#FD5A7E',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 28,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    tipsContainer: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        width: '100%',
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginBottom: 4,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#065F46',
        flex: 1,
        lineHeight: 18,
    },
});