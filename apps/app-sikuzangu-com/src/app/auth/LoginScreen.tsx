import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PrimaryButton } from '@siku-zangu/react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessToken } from '@siku-zangu/react';
import { APIError } from '@siku-zangu/core';
import { isOnboardingComplete } from '@siku-zangu/react-native';

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { loginUser, isLoggingIn, error } = useAccessToken();

    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [secure, setSecure] = useState(true);
    const [phoneError, setPhoneError] = useState('');
    const [pinError, setPinError] = useState('');

    const language = (params.lang as 'en' | 'sw') ?? 'en';
    const displayCountryCode = '+255';
    const storageCountryCode = 'TZ';

    useEffect(() => {
        const phoneNumber = phone.replace(/\D/g, '');
        if (phone.length === 0) {
            setPhoneError(language === 'en' ? 'Phone number is required' : 'Nambari ya simu inahitajika');
        } else if (!/^\d{6,12}$/.test(phoneNumber)) {
            setPhoneError(language === 'en' ? 'Enter 6-12 digits' : 'Ingiza tarakimu 6-12');
        } else if (/[^0-9\s-]/.test(phone)) {
            setPhoneError(language === 'en' ? 'Only digits, spaces, or dashes allowed' : 'Tarakimu, nafasi, au viunganishi pekee vinavyoruhusiwa');
        } else {
            setPhoneError('');
        }
    }, [phone, language]);

    useEffect(() => {
        if (pin.length === 0) {
            setPinError(language === 'en' ? 'PIN is required' : 'Namba ya siri inahitajika');
        } else if (!/^\d{4}$/.test(pin)) {
            setPinError(language === 'en' ? 'Enter exactly 4 digits' : 'Ingiza tarakimu 4 haswa');
        } else {
            setPinError('');
        }
    }, [pin, language]);

    const handleLogin = async () => {
        const phoneNumber = phone.replace(/\D/g, '');
        const storedPhoneNumber = `${storageCountryCode} ${phoneNumber}`;

        if (!phone) {
            setPhoneError(language === 'en' ? 'Phone number is required' : 'Nambari ya simu inahitajika');
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                language === 'en' ? 'Please enter a valid phone number' : 'Tafadhali ingiza nambari ya simu sahihi'
            );
            return;
        }
        if (!pin) {
            setPinError(language === 'en' ? 'PIN is required' : 'Namba ya siri inahitajika');
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                language === 'en' ? 'Please enter a valid PIN' : 'Tafadhali ingiza namba ya siri sahihi'
            );
            return;
        }
        if (phoneError || pinError) {
            Alert.alert(
                language === 'en' ? 'Error' : 'Hitilafu',
                language === 'en' ? 'Please fix errors before logging in' : 'Tafadhali sahihisha makosa kabla ya kuingia'
            );
            return;
        }

        try {
            const accessToken = await loginUser({ phone_number: storedPhoneNumber, pin });

            if (!accessToken?.user?.user_id) {
                throw {
                    status: 500,
                    message: language === 'en' ? 'User ID not found in response' : 'Kitambulisho cha mtumiaji hakijapatikana',
                } as APIError;
            }

            const userId = accessToken.user.user_id;

            // Check if user has completed onboarding
            const hasCompletedOnboarding = await isOnboardingComplete(userId);

            Alert.alert(
                language === 'en' ? 'Success' : 'Mafanikio',
                language === 'en'
                    ? 'Logged in successfully!'
                    : 'Umeingia kwa mafanikio!',
                [
                    {
                        text: language === 'en' ? 'OK' : 'Sawa',
                        onPress: () => {
                            if (!hasCompletedOnboarding) {
                                // First time user - go to onboarding
                                router.replace({
                                    pathname: '/onboarding/UpdatingNamesScreen',
                                    params: {
                                        lang: language,
                                        userId: userId,
                                    },
                                });
                            } else {
                                // Returning user - go to home
                                router.replace({
                                    pathname: '/tabs/HomeScreen',
                                    params: {
                                        lang: language,
                                        userId: userId,
                                    },
                                });
                            }
                        },
                    },
                ]
            );
        } catch (e: any) {
            const errorMessage =
                (e as APIError).issues?.map((issue: any) => issue.message).join(', ') ||
                (e as APIError).message ||
                (e.status === 401
                    ? language === 'en'
                        ? 'Invalid phone number or PIN'
                        : 'Nambari ya simu au nenosiri si sahihi'
                    : e.status === 400
                        ? language === 'en'
                            ? 'Invalid input format'
                            : 'Muundo wa ingizo si sahihi'
                        : language === 'en'
                            ? 'Login failed'
                            : 'Kuingia kumeshindwa');
            Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
        }
    };

    const goToRegister = () => {
        router.push({
            pathname: '/auth/RegisterScreen',
            params: { lang: language }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{language === 'en' ? 'Login' : 'Ingia'}</Text>
            <Text style={styles.subtitle}>
                {language === 'en'
                    ? 'Welcome back! Track your menstrual \n cycle.'
                    : 'Karibu tena! Fuatilia mzunguko \n wako wa hedhi.'}
            </Text>

            <View style={styles.formBox}>
                <View style={styles.fieldWrapper}>
                    <Text style={styles.label}>{language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}</Text>
                    <View style={[styles.phoneWrapper, phoneError ? styles.errorBorder : null]}>
                        <Text style={styles.countryCode}>{displayCountryCode}</Text>
                        <TextInput
                            style={[styles.input, styles.phoneInput]}
                            placeholder={language === 'en' ? '712345678' : '712345678'}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={(text) => {
                                if (/^[0-9\s-]*$/.test(text)) {
                                    setPhone(text);
                                }
                            }}
                            maxLength={12}
                            accessibilityLabel={language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
                        />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>
                <View style={styles.fieldWrapper}>
                    <Text style={styles.label}>{language === 'en' ? 'PIN' : 'Namba ya Siri'}</Text>
                    <View style={[styles.pinWrapper, pinError ? styles.errorBorder : null]}>
                        <TextInput
                            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                            placeholder={language === 'en' ? 'Enter 4-digit PIN' : 'Ingiza nenosiri la tarakimu 4'}
                            secureTextEntry={secure}
                            value={pin}
                            onChangeText={(text) => {
                                if (/^\d*$/.test(text)) {
                                    setPin(text);
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={4}
                            accessibilityLabel={language === 'en' ? 'PIN' : 'Namba ya Siri'}
                        />
                        <TouchableOpacity onPress={() => setSecure(!secure)}>
                            <Ionicons
                                name={secure ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color="gray"
                                accessibilityLabel={language === 'en' ? 'Toggle PIN visibility' : 'Badilisha kuonekana kwa nenosiri'}
                            />
                        </TouchableOpacity>
                    </View>
                    {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
                </View>
                <TouchableOpacity>
                    <Text style={styles.forgotLink}>{language === 'en' ? 'Forgot PIN?' : 'Umesahau Nenosiri?'}</Text>
                </TouchableOpacity>

                <PrimaryButton
                    title={language === 'en' ? 'Login' : 'Ingia'}
                    onPress={handleLogin}
                    disabled={!!phoneError || !!pinError || !phone || !pin || isLoggingIn}
                    accessibilityLabel={language === 'en' ? 'Login' : 'Ingia'}
                />
            </View>
            <Text style={styles.footer}>
                {language === 'en' ? "Don't have an Account? " : 'Huna akaunti? '}
                <TouchableOpacity onPress={goToRegister}>
                    <Text style={styles.loginLink}>{language === 'en' ? 'Register' : 'Jisajili'}</Text>
                </TouchableOpacity>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF4EC',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 32,
    },
    title: {
        marginTop: 51,
        fontSize: 24,
        fontWeight: '500',
        color: '#E66386',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        fontWeight: '500',
        textAlign: 'center',
        color: '#333333',
    },
    formBox: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 16,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,
        alignSelf: 'stretch',
    },
    fieldWrapper: {
        width: '100%',
        gap: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        marginBottom: 6,
    },
    phoneWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFB6C1',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    countryCode: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '600',
        paddingVertical: 12,
        paddingRight: 20,
        borderRightWidth: 1,
        borderRightColor: '#FFB6C1',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    phoneInput: {
        marginLeft: 12,
    },
    pinWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFB6C1',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    errorBorder: {
        borderColor: '#E66386',
        borderWidth: 2,
    },
    forgotLink: {
        color: '#DD66DD',
        fontWeight: '600',
        fontSize: 14,
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    footer: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#666666',
    },
    loginLink: {
        color: '#E66386',
        fontWeight: '700',
        fontSize: 14,
    },
    errorText: {
        color: '#E66386',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
});