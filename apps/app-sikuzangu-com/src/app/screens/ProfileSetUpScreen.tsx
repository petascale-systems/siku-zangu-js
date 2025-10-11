import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetUp'>;

export const ProfileSetUpScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const [selectedLang, setSelectedLang] = useState<'en' | 'sw'>(language);

  useEffect(() => {
    console.log('ProfileSetUpScreen: Language from route:', language);
    setSelectedLang(language);
  }, [language]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {language === 'en' ? 'HEY SIKU ZANGU' : 'HALLO SIKU ZANGU'}
      </Text>
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