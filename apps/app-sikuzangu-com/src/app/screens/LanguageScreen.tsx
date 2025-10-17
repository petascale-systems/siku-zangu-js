import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LanguageCard } from '../components/LanguageCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

export const LanguageScreen = ({ navigation }: Props) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'sw'>('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('language', selectedLang);
      navigation.navigate('Register', { lang: selectedLang });
    } catch (error) {
      Alert.alert('Error', 'Failed to save language preference');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {selectedLang === 'en'
          ? 'Your Cycle. Your Health. Your Language'
          : 'Mzunguko Wako. Afya Yako. Lugha Yako'}
      </Text>
      <LanguageCard
        flag={require('../../../assets/images/uk.png')}
        title="English"
        subtitle="Welcome"
        selected={selectedLang === 'en'}
        onPress={() => setSelectedLang('en')}
      />
      <LanguageCard
        flag={require('../../../assets/images/tz.png')}
        title="Kiswahili"
        subtitle="Karibu"
        selected={selectedLang === 'sw'}
        onPress={() => setSelectedLang('sw')}
      />
      <PrimaryButton
        title={selectedLang === 'en' ? 'Continue in English' : 'Endelea Kwa Kiswahili'}
        onPress={handleContinue}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontSize: 22,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 30,
    color: '#FD5A7E',
    width: 272,
    height: 66,
  },
});