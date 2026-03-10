import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PrimaryButton } from '@siku-zangu/react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';
import { CountryCodePicker, COUNTRIES, Country } from '@siku-zangu/react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { upsertUser, isUpsertingUser, error } = useUser();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [secure, setSecure] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Kenya

  const language = (params.lang as 'en' | 'sw') ?? 'en';

  useEffect(() => {
    const phoneNumber = phone.replace(/\D/g, '');
    if (phone.length === 0) {
      setPhoneError(
          language === 'en'
              ? 'Phone number is required'
              : 'Nambari ya simu inahitajika'
      );
    } else if (!/^\d{6,12}$/.test(phoneNumber)) {
      setPhoneError(
          language === 'en' ? 'Enter 6-12 digits' : 'Ingiza tarakimu 6-12'
      );
    } else if (/[^0-9\s-]/.test(phone)) {
      setPhoneError(
          language === 'en'
              ? 'Only digits, spaces, or dashes allowed'
              : 'Tarakimu, nafasi, au viunganishi pekee vinavyoruhusiwa'
      );
    } else {
      setPhoneError('');
    }
  }, [phone, language]);

  useEffect(() => {
    if (pin.length === 0) {
      setPinError(
          language === 'en' ? 'PIN is required' : 'Nenosiri linahitajika'
      );
    } else if (!/^\d{4}$/.test(pin)) {
      setPinError(
          language === 'en' ? 'Enter exactly 4 digits' : 'Ingiza tarakimu 4 haswa'
      );
    } else {
      setPinError('');
    }
  }, [pin, language]);

  const handleRegister = async () => {
    const phoneNumber = phone.replace(/\D/g, '');
    const storedPhoneNumber = `${selectedCountry.code} ${phoneNumber}`;

    if (!phone) {
      setPhoneError(
          language === 'en'
              ? 'Phone number is required'
              : 'Nambari ya simu inahitajika'
      );
      Alert.alert(
          language === 'en' ? 'Error' : 'Hitilafu',
          language === 'en'
              ? 'Please enter a valid phone number'
              : 'Tafadhali ingiza nambari ya simu sahihi'
      );
      return;
    }
    if (!pin) {
      setPinError(
          language === 'en' ? 'PIN is required' : 'Nenosiri linahitajika'
      );
      Alert.alert(
          language === 'en' ? 'Error' : 'Hitilafu',
          language === 'en'
              ? 'Please enter a valid PIN'
              : 'Tafadhali ingiza nenosiri sahihi'
      );
      return;
    }
    if (phoneError || pinError) {
      Alert.alert(
          language === 'en' ? 'Error' : 'Hitilafu',
          language === 'en'
              ? 'Please fix errors before registering'
              : 'Tafadhali sahihisha makosa kabla ya kujisajili'
      );
      return;
    }
    try {
      const payload = {
        kv: {
          phone_number: storedPhoneNumber,
          pin,
          language,
          status: 'active' as const,
        },
      };
      await upsertUser(payload);
      Alert.alert(
          language === 'en' ? 'Success' : 'Mafanikio',
          language === 'en' ? 'Account created!' : 'Akaunti imefunguliwa!',
          [
            {
              text: language === 'en' ? 'OK' : 'Sawa',
              onPress: () =>
                  router.push({
                    pathname: '/auth/LoginScreen',
                    params: {
                      lang: language,
                    },
                  }),
            },
          ]
      );
    } catch (e: any) {
      let errorMessage = '';
      if (e.status === 400) {
        errorMessage = language === 'en'
            ? 'Invalid input format'
            : 'Muundo wa ingizo si sahihi';
      } else if (e.status === 409) {
        errorMessage = language === 'en'
            ? 'Phone number already taken'
            : 'Nambari ya simu tayari imechukuliwa';
      } else if (e.details) {
        errorMessage = e.details;
      } else if (e.message) {
        errorMessage = e.message;
      } else {
        errorMessage = language === 'en'
            ? 'Registration failed. Please try again.'
            : 'Usajili umeshindwa. Tafadhali jaribu tena.';
      }

      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  const goToLogin = () => {
    Keyboard.dismiss();
    router.push({
      pathname: '/auth/LoginScreen',
      params: { lang: language },
    });
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {language === 'en' ? 'Register' : 'Jisajili'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'en'
                ? 'Create your account to start tracking\nyour menstrual cycle.'
                : 'Fungua akaunti yako kuanza kufuatilia\nmzunguko wako wa hedhi.'}
          </Text>
          <View style={styles.formBox}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>
                {language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
              </Text>
              <View
                  style={[
                    styles.phoneWrapper,
                    phoneError ? styles.errorBorder : null,
                  ]}
              >
                <CountryCodePicker
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                    language={language}
                />
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
                    accessibilityLabel={
                      language === 'en' ? 'Phone Number' : 'Namba ya Simu'
                    }
                />
              </View>
              {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>
                {language === 'en' ? 'PIN' : 'Namba ya Siri'}
              </Text>
              <View
                  style={[styles.pinWrapper, pinError ? styles.errorBorder : null]}
              >
                <TextInput
                    style={[
                      styles.input,
                      { flex: 1, borderWidth: 0, marginBottom: 0 },
                    ]}
                    placeholder={
                      language === 'en'
                          ? 'Enter 4-digit PIN'
                          : 'Ingiza nenosiri la tarakimu 4'
                    }
                    secureTextEntry={secure}
                    value={pin}
                    onChangeText={(text) => {
                      if (/^\d*$/.test(text)) {
                        setPin(text);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    accessibilityLabel={language === 'en' ? 'PIN' : 'Nenosiri'}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Ionicons
                      name={secure ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="gray"
                      accessibilityLabel={
                        language === 'en'
                            ? 'Toggle PIN visibility'
                            : 'Badilisha kuonekana kwa nenosiri'
                      }
                  />
                </TouchableOpacity>
              </View>
              {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
            </View>
            <PrimaryButton
                title={language === 'en' ? 'Register' : 'Jisajili'}
                onPress={handleRegister}
                disabled={
                    !!phoneError || !!pinError || !phone || !pin || isUpsertingUser
                }
                accessibilityLabel={language === 'en' ? 'Register' : 'Jisajili'}
            />
          </View>
          <View style={styles.footerContainer}>
            <Text style={styles.footer}>
              {language === 'en'
                  ? 'Already have an Account? '
                  : 'Tayari una Akaunti? '}
            </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.loginLink}>
                {language === 'en' ? 'Log in' : 'Ingia'}
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
    backgroundColor: '#FFF4EC',
  },
  scrollContent: {
    flexGrow: 1,
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
    fontFamily: 'Inter',
    fontStyle: 'normal',
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
    alignItems: 'center',
    gap: 20,
    alignSelf: 'stretch',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 12,
  },
  fieldWrapper: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#333333',
    marginBottom: 6,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 10,
    paddingRight: 12,
    paddingVertical: 2,
    marginBottom: 15,
    width: '100%',
  },
  pinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 15,
  },
  errorBorder: {
    borderColor: '#E66386',
    borderWidth: 2,
  },
  footerContainer: {
    alignItems: 'center',
    gap: 4,
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
    fontFamily: 'Inter',
    marginTop: -10,
    marginBottom: 10,
  },
});