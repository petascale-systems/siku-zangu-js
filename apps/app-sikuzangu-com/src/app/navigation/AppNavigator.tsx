import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageScreen } from '../screens/LanguageScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileSetUpScreen } from '../screens/ProfileSetUpScreen';

export type RootStackParamList = {
  Language: undefined;
  Register: { lang: 'en' | 'sw' };
  Login: { lang: 'en' | 'sw' };
  ProfileSetUp: { lang: 'en' | 'sw' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Language"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProfileSetUp" component={ProfileSetUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
