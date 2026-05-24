import React, { useEffect, useRef, useState } from 'react';
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
import { COUNTRIES } from '@siku-zangu/expo';

type Lang = 'en' | 'sw';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

export default function VerifyOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language: Lang = (params.lang as Lang) ?? 'en';
    const phone = params.phone as string;
    const storagePhone = params.storagePhone as string; // "KE 716899396" or "TZ 712345678"

    // Get country info from storagePhone
    const [countryCode] = storagePhone.split(' ');
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

    const t = {
        en: {
            title: 'Verify Code',
            subtitle: `Enter the 6-digit code sent to ${selectedCountry.dialCode} ${phone}`,
            verify: 'Verify',
            resendIn: (sec: number) => `Resend code in ${sec}s`,
            resend: 'Resend Code',
            changeNumber: 'Change number',
            errorTitle: 'Error',
            errorIncomplete: 'Please enter the complete 6-digit code',
            errorWrong: 'Incorrect code. Please try again.',
            errorExpired: 'Code has expired. Please request a new one.',
            errorGeneric: 'Verification failed. Please try again.',
            resendSuccessTitle: 'Code Sent!',
            resendSuccessMsg: 'A new verification code has been sent.',
        },
        sw: {
            title: 'Thibitisha Nambari',
            subtitle: `Weka nambari ya tarakimu 6 iliyotumwa kwa ${selectedCountry.dialCode} ${phone}`,
            verify: 'Thibitisha',
            resendIn: (sec: number) => `Tuma tena baada ya sekunde ${sec}`,
            resend: 'Tuma Tena Nambari',
            changeNumber: 'Badilisha namba',
            errorTitle: 'Hitilafu',
            errorIncomplete: 'Tafadhali weka nambari kamili ya tarakimu 6',
            errorWrong: 'Nambari si sahihi. Tafadhali jaribu tena.',
            errorExpired: 'Nambari imeisha muda. Tafadhali omba mpya.',
            errorGeneric: 'Uthibitisho umeshindwa. Tafadhali jaribu tena.',
            resendSuccessTitle: 'Nambari Imetumwa!',
            resendSuccessMsg: 'Nambari mpya ya uthibitisho imetumwa.',
        },
    };

    const tx = t[language];
    const { verifyResetCode, sendResetCode, isVerifyingOtp, isRequestingReset } = useUser();

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [cooldown, setCooldown] = useState(0);
    const inputs = useRef<Array<TextInput | null>>([]);

    const otpValue = otp.join('');
    const isComplete = otpValue.length === OTP_LENGTH;

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value.slice(-1);
        setOtp(updated);
        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            const updated = [...otp];
            updated[index - 1] = '';
            setOtp(updated);
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        if (!isComplete) {
            Alert.alert(tx.errorTitle, tx.errorIncomplete);
            return;
        }
        try {
            const { reset_token } = await verifyResetCode(storagePhone, otpValue);
            router.replace({
                pathname: '/auth/ResetPinScreen',
                params: {
                    lang: language,
                    phone,
                    storagePhone,
                    resetToken: reset_token,
                },
            });
        } catch (e: any) {
            let msg = tx.errorGeneric;
            if (e?.status === 400) msg = tx.errorWrong;
            if (e?.status === 410) msg = tx.errorExpired;
            else if (e?.message) msg = e.message;
            Alert.alert(tx.errorTitle, msg);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || isRequestingReset) return;
        try {
            await sendResetCode(storagePhone);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputs.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN_SEC);
            Alert.alert(tx.resendSuccessTitle, tx.resendSuccessMsg);
        } catch (e: any) {
            Alert.alert(
                tx.errorTitle,
                e?.message ?? (language === 'en'
                    ? 'Failed to resend code. Please try again.'
                    : 'Imeshindwa kutuma tena. Tafadhali jaribu tena.')
            );
        }
    };

    const handlePaste = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
        const updated = [...otp];
        for (let i = 0; i < digits.length; i++) {
            updated[i] = digits[i];
        }
        setOtp(updated);
        const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
        inputs.current[nextIndex]?.focus();
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
                    <Ionicons name="chatbox-ellipses-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                <View style={styles.formBox}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputs.current[index] = ref)}
                                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                                value={digit}
                                onChangeText={(val) => handleChange(val, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    handlePaste(e.nativeEvent.clipboardData?.getData('text') || '');
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                accessibilityLabel={`Digit ${index + 1}`}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={!isComplete || isVerifyingOtp}
                        activeOpacity={0.8}
                    >
                        {isVerifyingOtp ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.verifyButtonText}>{tx.verify}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        {cooldown > 0 ? (
                            <Text style={styles.cooldownText}>{tx.resendIn(cooldown)}</Text>
                        ) : (
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={isRequestingReset}
                                style={styles.resendButton}
                            >
                                {isRequestingReset ? (
                                    <ActivityIndicator size="small" color="#E66386" />
                                ) : (
                                    <Text style={styles.resendText}>{tx.resend}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.changeNumber} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={16} color="#E66386" />
                    <Text style={styles.changeNumberText}>{tx.changeNumber}</Text>
                </TouchableOpacity>
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 8,
    },
    otpBox: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: '#FFB6C1',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
    },
    otpBoxFilled: {
        borderColor: '#E66386',
        backgroundColor: '#FFF',
    },
    verifyButton: {
        backgroundColor: '#E66386',
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#E66386',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButtonDisabled: {
        opacity: 0.5,
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    resendContainer: {
        alignItems: 'center',
        minHeight: 40,
        justifyContent: 'center',
    },
    resendButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resendText: {
        color: '#E66386',
        fontWeight: '600',
        fontSize: 14,
    },
    cooldownText: {
        color: '#999999',
        fontSize: 14,
    },
    changeNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changeNumberText: {
        color: '#E66386',
        fontWeight: '600',
        fontSize: 14,
    },
});