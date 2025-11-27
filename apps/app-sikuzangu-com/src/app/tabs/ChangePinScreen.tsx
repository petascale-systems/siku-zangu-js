import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '@siku-zangu/react';
import { useLocalSearchParams, useRouter } from 'expo-router';


export default  function ChangePinScreen  ()  {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { changePin, isChangingPin } = useUser(userId);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const handleBack = () => router.back();
  const validatePin = (pin: string): boolean => {
    return /^\d{4}$/.test(pin);
  };
  const handleSavePin = async () => {
    if (!validatePin(currentPin)) {
      Alert.alert(
        language === 'sw' ? 'PIN si Sahihi' : 'Invalid PIN',
        language === 'sw'
          ? 'PIN ya sasa lazima iwe na tarakimu 4.'
          : 'Current PIN must be exactly 4 digits.'
      );
      return;
    }
    if (!validatePin(newPin)) {
      Alert.alert(
        language === 'sw' ? 'PIN si Sahihi' : 'Invalid PIN',
        language === 'sw'
          ? 'PIN mpya lazima iwe na tarakimu 4.'
          : 'New PIN must be exactly 4 digits.'
      );
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(
        language === 'sw' ? 'PIN Hazilingani' : 'PINs Do Not Match',
        language === 'sw'
          ? 'Tafadhali hakikisha PIN zote mbili ni sawa.'
          : 'Please ensure both PINs are the same.'
      );
      return;
    }
    if (newPin === '1234' || newPin === '0000' || newPin === '1111') {
      Alert.alert(
        language === 'sw' ? 'PIN Dhaifu' : 'Weak PIN',
        language === 'sw'
          ? 'Tafadhali chagua PIN ambayo haiwezi kukisiwa rahisi.'
          : 'Please choose a PIN that is not easy to guess.'
      );
      return;
    }

    try {
      await changePin(currentPin, newPin);
      Alert.alert(
        language === 'sw' ? 'Mafanikio' : 'Success',
        language === 'sw'
          ? 'PIN yako imebadilishwa kikamilifu!'
          : 'Your PIN has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');

              router.push('/auth/LoginScreen');
            },
          },
        ]
      );
    } catch (e: any) {
      let errorMessage = '';
      if (e.status === 401) {
        errorMessage = language === 'sw'
          ? 'PIN ya sasa si sahihi.'
          : 'Current PIN is incorrect.';
      } else if (e.status === 400 && e.message?.includes('different')) {
        errorMessage = language === 'sw'
          ? 'PIN mpya haiwezi kuwa sawa na PIN ya sasa.'
          : 'New PIN must be different from current PIN.';
      } else if (e.status === 400 && e.message?.includes('weak')) {
        errorMessage = language === 'sw'
          ? 'PIN hii ni dhaifu. Tafadhali chagua PIN tofauti.'
          : 'This PIN is too weak. Please choose a different PIN.';
      } else {
        errorMessage = e.message ||
          (language === 'sw'
            ? 'Imeshindwa kubadilisha PIN. Tafadhali jaribu tena.'
            : 'Failed to change PIN. Please try again.');
      }
      Alert.alert(
        language === 'sw' ? 'Hitilafu' : 'Error',
        errorMessage
      );
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'sw' ? 'Badilisha PIN' : 'Change PIN'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.subtitle}>
          {language === 'sw'
            ? 'Weka PIN yako mpya ya akaunti yako. Hakikisha haijasiwa rahisi na ni ya kipekee ili kuongeza usalama.'
            : "Enter your new PIN for your account. Ensure it's not easy to guess and unique to enhance security."}
        </Text>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {language === 'sw' ? 'PIN YA SASA' : 'CURRENT PIN'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={currentPin}
                onChangeText={setCurrentPin}
                placeholder="****"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showCurrentPin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPin(!showCurrentPin)}
              >
                <Ionicons
                  name={showCurrentPin ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {language === 'sw' ? 'UNDA PIN MPYA' : 'CREATE NEW PIN'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="****"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showNewPin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPin(!showNewPin)}
              >
                <Ionicons
                  name={showNewPin ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {language === 'sw' ? 'THIBITISHA PIN MPYA' : 'CONFIRM NEW PIN'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="****"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!showConfirmPin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPin(!showConfirmPin)}
              >
                <Ionicons
                  name={showConfirmPin ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isChangingPin && styles.saveButtonDisabled,
          ]}
          onPress={handleSavePin}
          disabled={isChangingPin}
          activeOpacity={0.8}
        >
          {isChangingPin ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {language === 'sw' ? 'HIFADHI PIN MPYA' : 'SAVE NEW PIN'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {language === 'sw' ? 'Vidokezo vya Usalama:' : 'Security Tips:'}
          </Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Tumia PIN ambayo huwezi kusahau lakini haiwezi kukisiwa'
                : 'Use a PIN you can remember but others cannot guess'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Epuka PIN rahisi kama 1234 au 0000'
                : 'Avoid simple PINs like 1234 or 0000'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Usimshirikishe mtu yeyote PIN yako'
                : 'Never share your PIN with anyone'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'PIN mpya lazima iwe tofauti na PIN ya sasa'
                : 'New PIN must be different from your current PIN'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
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
    marginBottom: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'Inter',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#645F5F',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: 'Inter',
    fontWeight: '400',
    textAlign: 'center',
  },
  form: {
    gap: 24,
    marginBottom: 32,
    padding:16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#645F5F',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
    fontFamily: 'Inter',
    letterSpacing: 2,
  },
  eyeButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#FF597D',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD5A7E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  tipsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
    fontWeight: '400',
  },
});