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
import { useUser } from '@siku-zangu/react';

type Lang = 'en' | 'sw';

const t = {
    en: {
        title: 'Verify Code',
        subtitle: (phone: string) => `Enter the 6-digit code sent to +255 ${phone}`,
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
        subtitle: (phone: string) => `Weka nambari ya tarakimu 6 iliyotumwa kwa +255 ${phone}`,
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

export default function VerifyOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language: Lang = (params.lang as Lang) ?? 'en';
    const phone = params.phone as string;             // raw digits e.g. "712345678"
    const storagePhone = params.storagePhone as string; // e.g. "TZ 712345678"
    const tx = t[language];

    const { verifyResetCode, sendResetCode, isVerifyingOtp, isRequestingReset } = useUser();

    // ── OTP state ────────────────────────────────────────────────────────────
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const inputs = useRef<(TextInput | null)[]>([]);
    const otpValue = otp.join('');
    const isComplete = otpValue.length === OTP_LENGTH;

    // ── Cooldown timer ───────────────────────────────────────────────────────
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // ── OTP input helpers ────────────────────────────────────────────────────
    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        // Handle paste: spread digits across all boxes
        if (value.length > 1) {
            const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
            const next = Array(OTP_LENGTH).fill('');
            pasted.split('').forEach((ch, i) => { next[i] = ch; });
            setOtp(next);
            inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
            return;
        }

        const updated = [...otp];
        updated[index] = value;
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

    // ── Verify ───────────────────────────────────────────────────────────────
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

    // ── Resend ───────────────────────────────────────────────────────────────
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
                e?.message ?? tx.errorGeneric
            );
        }
    };

    const isVerifyDisabled = !isComplete || isVerifyingOtp;

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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333333" />
                    </TouchableOpacity>
                    <View style={{ width: 40 }} />
                </View>

                {/* Icon */}
                <View style={styles.iconCircle}>
                    <Ionicons name="chatbubble-ellipses-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle(phone)}</Text>

                {/* OTP boxes */}
                <View style={styles.otpRow}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputs.current[index] = ref; }}
                            style={[
                                styles.otpBox,
                                digit ? styles.otpBoxFilled : null,
                            ]}
                            value={digit}
                            onChangeText={(val) => handleOtpChange(val, index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="numeric"
                            maxLength={OTP_LENGTH}
                            selectTextOnFocus
                            accessibilityLabel={`Digit ${index + 1}`}
                        />
                    ))}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                    style={[styles.verifyButton, isVerifyDisabled && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={isVerifyDisabled}
                    activeOpacity={0.8}
                >
                    {isVerifyingOtp ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.verifyButtonText}>{tx.verify}</Text>
                    )}
                </TouchableOpacity>

                {/* Resend */}
                <View style={styles.resendContainer}>
                    {cooldown > 0 ? (
                        <Text style={styles.cooldownText}>{tx.resendIn(cooldown)}</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend} disabled={isRequestingReset}>
                            {isRequestingReset ? (
                                <ActivityIndicator size="small" color="#E66386" />
                            ) : (
                                <Text style={styles.resendText}>{tx.resend}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Change number */}
                <TouchableOpacity style={styles.changeNumber} onPress={() => router.back()}>
                    <Ionicons name="pencil-outline" size={14} color="#E66386" />
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
    backButton: { padding: 6 },
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
        marginBottom: 36,
        paddingHorizontal: 8,
    },
    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 36,
    },
    otpBox: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#FFB6C1',
        backgroundColor: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        color: '#333333',
        textAlign: 'center',
    },
    otpBoxFilled: {
        borderColor: '#E66386',
        backgroundColor: '#FFF0F5',
    },
    verifyButton: {
        backgroundColor: '#E66386',
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#E66386',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 24,
    },
    buttonDisabled: { opacity: 0.5 },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    resendContainer: {
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cooldownText: { fontSize: 14, color: '#999999' },
    resendText: { fontSize: 14, fontWeight: '600', color: '#E66386' },
    changeNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    changeNumberText: { fontSize: 14, color: '#E66386', fontWeight: '500' },
});