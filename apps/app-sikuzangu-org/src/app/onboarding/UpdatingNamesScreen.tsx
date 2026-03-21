import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';
import { User } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdatingNamesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { upsertUser, isUpsertingUser, error, user, isFetchingUser } =
      useUser(userId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  useEffect(() => {
    if (user && !isFetchingUser && !firstName && !lastName) {
      setFirstName(user.kv?.first_name || '');
      setLastName(user.kv?.last_name || '');
    }
  }, [user, isFetchingUser]);

  const validateName = (name: string, field: 'first' | 'last'): string => {
    if (field === 'first' && name.length === 0) {
      return language === 'en'
          ? 'First name is required'
          : 'Jina la kwanza linahitajika';
    }
    if (field === 'last' && name.length === 0) {
      return '';
    }
    if (name.length > 50) {
      return language === 'en'
          ? `${
              field === 'first' ? 'First' : 'Last'
          } name must be at most 50 characters`
          : `${
              field === 'first' ? 'Jina la kwanza' : 'Jina la mwisho'
          } linapaswa kuwa hadi herufi 50`;
    }
    return '';
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (hasAttemptedSave) {
      setFirstNameError(validateName(text, 'first'));
    }
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    if (hasAttemptedSave) {
      setLastNameError(validateName(text, 'last'));
    }
  };

  const handleSave = async () => {
    setHasAttemptedSave(true);

    const firstError = validateName(firstName.trim(), 'first');
    const lastError = validateName(lastName.trim(), 'last');

    setFirstNameError(firstError);
    setLastNameError(lastError);

    if (firstError || lastError) {
      Alert.alert(
          language === 'en' ? 'Error' : 'Hitilafu',
          language === 'en'
              ? 'Please fix errors before saving'
              : 'Tafadhali sahihisha makosa kabla ya kuhifadhi'
      );
      return;
    }

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
          first_name: firstName.trim(),
        },
      };

      if (lastName.trim()) {
        updateData.kv!.last_name = lastName.trim();
      }
      await upsertUser(updateData);
      router.push({
        pathname: '/onboarding/UpdatingDOBScreen',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
          e.message ||
          (language === 'en'
              ? 'Failed to update names'
              : 'Imeshindwa kubadilisha majina');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  const isFormValid =
      firstName.trim().length > 0 && !firstNameError && !lastNameError;

  if (isFetchingUser) {
    return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#FF4081" />
          <Text style={styles.loadingText}>
            {language === 'en' ? 'Loading...' : 'Inapakia...'}
          </Text>
        </View>
    );
  }

  return (
      <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel={language === 'en' ? 'Go back' : 'Rudi nyuma'}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {language === 'en' ? 'Set up your profile' : 'Weka profaili yako'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'en'
                  ? "Let's get to know you better!"
                  : 'Tukujue vizuri zaidi!'}
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  {language === 'en'
                      ? 'First name (required)'
                      : 'Jina la kwanza (lazima)'}
                </Text>
                <TextInput
                    style={[
                      styles.input,
                      firstNameError ? styles.errorBorder : null,
                    ]}
                    value={firstName}
                    onChangeText={handleFirstNameChange}
                    placeholder={
                      language === 'en'
                          ? 'Enter first name'
                          : 'Ingiza jina la kwanza'
                    }
                    placeholderTextColor="#999"
                    maxLength={50}
                    accessibilityLabel={
                      language === 'en' ? 'First name' : 'Jina la kwanza'
                    }
                    editable={!isUpsertingUser}
                />
                {firstNameError ? (
                    <Text style={styles.errorText}>{firstNameError}</Text>
                ) : null}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  {language === 'en'
                      ? 'Last name (optional)'
                      : 'Jina la mwisho (si lazima)'}
                </Text>
                <TextInput
                    style={[styles.input, lastNameError ? styles.errorBorder : null]}
                    value={lastName}
                    onChangeText={handleLastNameChange}
                    placeholder={
                      language === 'en'
                          ? 'Enter last name'
                          : 'Ingiza jina la mwisho'
                    }
                    placeholderTextColor="#999"
                    maxLength={50}
                    accessibilityLabel={
                      language === 'en' ? 'Last name' : 'Jina la mwisho'
                    }
                    editable={!isUpsertingUser}
                />
                {lastNameError ? (
                    <Text style={styles.errorText}>{lastNameError}</Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.privacyText}>
              {language === 'en'
                  ? "We know how much privacy matters to you. That's why we never share data without consent."
                  : 'Tujua jinsi faragha inavyokuwa muhimu kwako. Ndiyo maana hatutoi data bila idhini.'}
            </Text>
            <TouchableOpacity>
              <Text
                  style={styles.privacyLink}
                  onPress={() =>
                      Linking.openURL('https://sikuzangu.org/privacy-policy')
                  }
              >
                {language === 'en' ? 'Privacy Policy' : 'Sera ya Faragha'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!isFormValid || isUpsertingUser || !userId) &&
                  styles.nextButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isFormValid || isUpsertingUser || !userId}
                accessibilityLabel={language === 'en' ? 'Next' : 'IFUATAYO'}
            >
              {isUpsertingUser ? (
                  <ActivityIndicator size="small" color="#FD5A7E" />
              ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {language === 'en' ? 'Next' : 'IFUATAYO'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#FFF5F2',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
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
    color: '#333333',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 80,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f4a5a5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    fontFamily: 'Inter',
  },
  errorBorder: {
    borderColor: '#E66386',
    borderWidth: 2,
  },
  errorText: {
    color: '#E66386',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Inter',
  },
  privacyText: {
    fontSize: 12,
    marginTop: 80,
    fontStyle: 'normal',
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#645F5F',
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyLink: {
    color: '#E66386',
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#FD5A7E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB6C1',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontStyle: 'normal',
    fontFamily: 'Inter',
  },
});