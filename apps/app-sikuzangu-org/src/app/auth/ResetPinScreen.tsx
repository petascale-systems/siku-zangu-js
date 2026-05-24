import React, { useEffect, useState } from 'react';
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
import { useUser } from '@siku-zangu/react-native';

type Lang = 'en' | 'sw';

const t = {
    en: {
        title: 'Set New PIN',
        subtitle: "Choose a new 4-digit PIN for your account. Make sure it's memorable but hard to guess.",
        newPinLabel: 'New PIN',
        confirmPinLabel: 'Confirm PIN',
        placeholder: '••••',
        save: 'Save New PIN',
        errorTitle: 'Error',
        errorRequired: 'Please enter a PIN',
        errorLength: 'PIN must be exactly 4 digits',
        errorMatch: 'PINs do not match',
        errorWeak: 'This PIN is too weak. Please choose a different PIN.',
        errorSameAsOld: 'New PIN must be different from your current PIN',
        successTitle: 'Success!',
        successMsg: 'Your PIN has been reset successfully.',
        securityTips: 'Security Tips:',
        tip1: 'Use a PIN you can remember but others cannot guess',
        tip2: 'Avoid simple PINs like 1234 or 0000',
        tip3: 'Never share your PIN with anyone',
        tip4: 'Change your PIN regularly for added security',
    },
    sw: {
        title: 'Weka PIN Mpya',
        subtitle: 'Chagua PIN mpya ya tarakimu 4 kwa akaunti yako. Hakikisha inakumbukwa lakini ni ngumu kukisia.',
        newPinLabel: 'PIN Mpya',
        confirmPinLabel: 'Thibitisha PIN',
        placeholder: '••••',
        save: 'Hifadhi PIN Mpya',
        errorTitle: 'Hitilafu',
        errorRequired: 'Tafadhali weka PIN',
        errorLength: 'PIN lazima iwe tarakimu 4 haswa',
        errorMatch: 'PIN hazifanani',
        errorWeak: 'PIN hii ni dhaifu sana. Tafadhali chagua PIN tofauti.',
        errorSameAsOld: 'PIN mpya lazima iwe tofauti na PIN yako ya sasa',
        successTitle: 'Mafanikio!',
        successMsg: 'PIN yako imebadilishwa kwa mafanikio.',
        securityTips: 'Vidokezo vya Usalama:',
        tip1: 'Tumia PIN unayoweza kukumbuka lakini wengine hawawezi kukisia',
        tip2: 'Epuka PIN rahisi kama 1234 au 0000',
        tip3: 'Usishiriki PIN yako na mtu yeyote',
        tip4: 'Badilisha PIN yako mara kwa mara kwa usalama zaidi',
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
    const tx = t[language];

    const phone = params.phone as string;
    const storagePhone = params.storagePhone as string;
    const resetToken = params.resetToken as string;

    const { submitNewPin, isResettingPin } = useUser();

    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const pinsMatch = newPin === confirmPin && newPin.length === 4;
    const isWeak = WEAK_PINS.includes(newPin);
    const canSubmit = newPin.length === 4 && confirmPin.length === 4 && pinsMatch && !isWeak;

    const handleSubmit = async () => {
        if (!newPin || !confirmPin) {
            Alert.alert(tx.errorTitle, tx.errorRequired);
            return;
        }
        if (newPin.length !== 4 || confirmPin.length !== 4) {
            Alert.alert(tx.errorTitle, tx.errorLength);
            return;
        }
        if (newPin !== confirmPin) {
            Alert.alert(tx.errorTitle, tx.errorMatch);
            return;
        }
        if (isWeak) {
            Alert.alert(tx.errorTitle, tx.errorWeak);
            return;
        }

        try {
            await submitNewPin(storagePhone, resetToken, newPin);
            Alert.alert(
                tx.successTitle,
                tx.successMsg,
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace({
                            pathname: '/auth/LoginScreen',
                            params: { lang: language },
                        }),
                    },
                ]
            );
        } catch (e: any) {
            let msg = e?.message;
            if (e?.status === 400 && msg?.includes('different')) {
                msg = tx.errorSameAsOld;
            } else if (e?.status === 400) {
                msg = tx.errorWeak;
            } else if (!msg) {
                msg = language === 'en'
                    ? 'Failed to reset PIN. Please try again.'
                    : 'Imeshindwa kubadilisha PIN. Tafadhali jaribu tena.';
            }
            Alert.alert(tx.errorTitle, msg);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333333" />
                    </TouchableOpacity>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.iconCircle}>
                    <Ionicons name="key-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                <View style={styles.formBox}>
                    {/* New PIN */}
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>{tx.newPinLabel}</Text>
                        <View style={styles.pinWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={tx.placeholder}
                                placeholderTextColor="#BBBBBB"
                                secureTextEntry={secureNew}
                                value={newPin}
                                onChangeText={(text) => {
                                    if (/^\d*$/.test(text)) setNewPin(text);
                                }}
                                keyboardType="numeric"
                                maxLength={4}
                                accessibilityLabel={tx.newPinLabel}
                            />
                            <TouchableOpacity onPress={() => setSecureNew(!secureNew)}>
                                <Ionicons
                                    name={secureNew ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.strengthIndicator}>
                            {[1, 2, 3, 4].map((dot) => (
                                <View
                                    key={dot}
                                    style={[
                                        styles.strengthDot,
                                        newPin.length >= dot && styles.strengthDotFilled,
                                        newPin.length === 4 && isWeak && styles.strengthDotWeak,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Confirm PIN */}
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>{tx.confirmPinLabel}</Text>
                        <View style={styles.pinWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={tx.placeholder}
                                placeholderTextColor="#BBBBBB"
                                secureTextEntry={secureConfirm}
                                value={confirmPin}
                                onChangeText={(text) => {
                                    if (/^\d*$/.test(text)) setConfirmPin(text);
                                }}
                                keyboardType="numeric"
                                maxLength={4}
                                accessibilityLabel={tx.confirmPinLabel}
                            />
                            <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                                <Ionicons
                                    name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPin.length === 4 && (
                            <View style={styles.matchIndicator}>
                                <Ionicons
                                    name={pinsMatch ? 'checkmark-circle' : 'close-circle'}
                                    size={18}
                                    color={pinsMatch ? '#4CAF50' : '#E66386'}
                                />
                                <Text
                                    style={[
                                        styles.matchText,
                                        pinsMatch ? styles.matchTextSuccess : styles.matchTextError,
                                    ]}
                                >
                                    {pinsMatch
                                        ? (language === 'en' ? 'PINs match' : 'PIN zinafanana')
                                        : (language === 'en' ? 'PINs do not match' : 'PIN hazifanani')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!canSubmit || isResettingPin}
                        activeOpacity={0.8}
                    >
                        {isResettingPin ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{tx.save}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.tipsBox}>
                    <Text style={styles.tipsTitle}>{tx.securityTips}</Text>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip1}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip2}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip3}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip4}</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF4EC',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    backButton: {
        padding: 6,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#FFE8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 24,
        shadowColor: '#E66386',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#E66386',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    formBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 24,
    },
    fieldWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        marginBottom: 8,
    },
    pinWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFB6C1',
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FAFAFA',
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#333333',
        paddingVertical: 13,
        letterSpacing: 8,
    },
    strengthIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    strengthDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
    },
    strengthDotFilled: {
        backgroundColor: '#4CAF50',
    },
    strengthDotWeak: {
        backgroundColor: '#E66386',
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    matchText: {
        fontSize: 12,
        fontWeight: '500',
    },
    matchTextSuccess: {
        color: '#4CAF50',
    },
    matchTextError: {
        color: '#E66386',
    },
    saveButton: {
        backgroundColor: '#E66386',
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#E66386',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    tipsBox: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        gap: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
});