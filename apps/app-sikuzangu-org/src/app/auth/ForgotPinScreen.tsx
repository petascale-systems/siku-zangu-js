import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@siku-zangu/react-native';
import { CountryCodePicker, COUNTRIES, Country } from '@siku-zangu/expo';

type Lang = 'en' | 'sw';

const t = {
    en: {
        title: 'Forgot PIN?',
        subtitle: "No worries! Enter the phone number linked to your account and we'll send you a verification code.",
        phoneLabel: 'Phone Number',
        phonePlaceholder: '712345678',
        errorRequired: 'Phone number is required',
        errorDigits: 'Enter 6–12 digits',
        errorChars: 'Only digits, spaces, or dashes allowed',
        sendCode: 'Send Verification Code',
        backToLogin: 'Back to Login',
        errorTitle: 'Error',
    },
    sw: {
        title: 'Umesahau PIN?',
        subtitle: 'Usiwe na wasiwasi! Weka namba ya simu iliyounganishwa na akaunti yako na tutakutumia nambari ya uthibitisho.',
        phoneLabel: 'Namba ya Simu',
        phonePlaceholder: '712345678',
        errorRequired: 'Namba ya simu inahitajika',
        errorDigits: 'Ingiza tarakimu 6–12',
        errorChars: 'Tarakimu, nafasi, au viunganishi pekee vinavyoruhusiwa',
        sendCode: 'Tuma Nambari ya Uthibitisho',
        backToLogin: 'Rudi kwenye Kuingia',
        errorTitle: 'Hitilafu',
    },
};

export default function ForgotPinScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const language: Lang = (params.lang as Lang) ?? 'en';
    const tx = t[language];

    const { sendResetCode, isRequestingReset } = useUser();
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'TZ') ?? COUNTRIES[0]);

    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        const digits = phone.replace(/\D/g, '');
        if (phone.length === 0) {
            setPhoneError(tx.errorRequired);
        } else if (!/^\d{6,12}$/.test(digits)) {
            setPhoneError(tx.errorDigits);
        } else if (/[^0-9\s-]/.test(phone)) {
            setPhoneError(tx.errorChars);
        } else {
            setPhoneError('');
        }
    }, [phone, language]);

    const handleSendCode = async () => {
        if (!phone || phoneError) {
            Alert.alert(tx.errorTitle, phoneError || tx.errorRequired);
            return;
        }

        const digits = phone.replace(/\D/g, '');
        const storedPhoneNumber = `${selectedCountry.code} ${digits}`;

        try {
            await sendResetCode(storedPhoneNumber);
            router.push({
                pathname: '/auth/VerifyOtpScreen',
                params: {
                    lang: language,
                    phone: digits,
                    storagePhone: storedPhoneNumber,
                },
            });
        } catch (e: any) {
            Alert.alert(
                tx.errorTitle,
                e?.message ?? (language === 'en'
                    ? 'Failed to send code. Please try again.'
                    : 'Imeshindwa kutuma nambari. Tafadhali jaribu tena.')
            );
        }
    };

    const isDisabled = isRequestingReset || !!phoneError || !phone;

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
                    <Ionicons name="lock-closed-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                {/* Form */}
                <View style={styles.formBox}>
                    <Text style={styles.label}>{tx.phoneLabel}</Text>
                    <View style={[styles.phoneWrapper, phoneError ? styles.errorBorder : null]}>
                        <CountryCodePicker
                            selectedCountry={selectedCountry}
                            onSelect={setSelectedCountry}
                            language={language}
                        />
                        <TextInput
                            style={[styles.input, styles.phoneInput]}
                            placeholder={tx.phonePlaceholder}
                            placeholderTextColor="#BBBBBB"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={(text) => {
                                if (/^[0-9\s-]*$/.test(text)) setPhone(text);
                            }}
                            maxLength={12}
                            accessibilityLabel={tx.phoneLabel}
                        />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                    <TouchableOpacity
                        style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
                        onPress={handleSendCode}
                        disabled={isDisabled}
                        activeOpacity={0.8}
                    >
                        {isRequestingReset ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>{tx.sendCode}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Back to login */}
                <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={16} color="#E66386" />
                    <Text style={styles.backToLoginText}>{tx.backToLogin}</Text>
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
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        marginBottom: 8,
    },
    phoneWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFB6C1',
        borderRadius: 10,
        paddingRight: 12,
        marginBottom: 6,
        backgroundColor: '#FAFAFA',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        paddingVertical: 13,
        paddingHorizontal: 10,
    },
    phoneInput: {
        marginLeft: 12,
    },
    errorBorder: {
        borderColor: '#E66386',
        borderWidth: 2,
    },
    errorText: {
        color: '#E66386',
        fontSize: 12,
        marginBottom: 12,
        marginTop: 2,
    },
    sendButton: {
        backgroundColor: '#E66386',
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: '#E66386',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backToLoginText: {
        color: '#E66386',
        fontWeight: '600',
        fontSize: 14,
    },
});