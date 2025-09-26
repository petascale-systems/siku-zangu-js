import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation, route }: Props) => {
  const { upsertUser, isUpsertingUser, error } = useUser();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [secure, setSecure] = useState(true);
  const language = route.params?.lang || 'en';

  const handleRegister = async () => {
    const phoneRegex = /^[A-Z]{2}\d{6,12}$/;
    const pinRegex = /^\d{4}$/;

    if (!phoneRegex.test(phone)) {
      Alert.alert(
        language === 'en' ? 'Error' : 'Hitilafu',
        language === 'en'
          ? 'Please enter a valid phone number (e.g., KE12345678).'
          : 'Tafadhali ingiza nambari ya simu sahihi (mfano KE12345678).'
      );
      return;
    }

    if (!pinRegex.test(pin)) {
      Alert.alert(
        language === 'en' ? 'Error' : 'Hitilafu',
        language === 'en'
          ? 'PIN must be exactly 4 digits.'
          : 'Nenosiri lazima liwe na nambari 4 haswa.'
      );
      return;
    }

    try {
      console.log('Sending payload to upsertUser:', { kv: { phone_number: phone, pin, language } });
      const user = await upsertUser({ kv: { phone_number: phone, pin, language } });
      Alert.alert(
        language === 'en' ? 'Success' : 'Mafanikio',
        language === 'en'
          ? 'Account created successfully!'
          : 'Akaunti imefunguliwa kwa mafanikio!',

      );
    } catch (e: any) {
      console.log('Registration error:', e);
      const errorMessage = error || // Use error from useUser if available
        (e.status === 409
          ? language === 'en'
            ? 'Phone number is already taken.'
            : 'Nambari ya simu tayari imechukuliwa.'
          : e.issues
            ? e.issues.map((issue: any) => issue.message).join(', ')
            : language === 'en'
              ? 'Failed to register. Please try again.'
              : 'Imeshindwa kujisajili. Tafadhali jaribu tena.');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'en' ? 'Register' : 'Jisajili'}</Text>
      <Text style={styles.subtitle}>
        {language === 'en'
          ? 'Create your account to start tracking\nyour menstrual cycle.'
          : 'Fungua akaunti yako kuanza kufuatilia\nmzunguko wako wa hedhi.'}
      </Text>
      <View style={styles.formBox}>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}</Text>
          <TextInput
            style={styles.input}
            placeholder={language === 'en' ? 'Enter Phone Number' : 'Ingiza Nambari ya Simu'}
            keyboardType='phone-pad'
            value={phone}
            onChangeText={setPhone}
            accessibilityLabel={language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}
          />
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{language === 'en' ? 'PIN' : 'Nenosiri'}</Text>
          <View style={styles.pinWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
              placeholder={language === 'en' ? 'Enter PIN' : 'Ingiza Nenosiri'}
              secureTextEntry={secure}
              value={pin}
              onChangeText={setPin}
              keyboardType='numeric'
              accessibilityLabel={language === 'en' ? 'PIN' : 'Nenosiri'}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color='gray'
                accessibilityLabel={language === 'en' ? 'Toggle PIN visibility' : 'Badilisha kuonekana kwa nenosiri'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <PrimaryButton
          title={language === 'en' ? 'Register' : 'Jisajili'}
          onPress={handleRegister}
          disabled={isUpsertingUser}
          accessibilityLabel={language === 'en' ? 'Register' : 'Jisajili'}
        />
      </View>
      <Text style={styles.footer}>
        {language === 'en' ? 'Already have an Account? ' : 'Tayari una Akaunti? '}
        <TouchableOpacity >
          <Text style={styles.loginLink}>{language === 'en' ? 'Log in' : 'Ingia'}</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
    height: 322,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'stretch',
  },
  input: {
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
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
  pinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  footer: {
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
    color: '#666666',
  },
  loginLink: {
    color: '#E66386',
    fontWeight: '700',
    fontSize: 14,
  },
});