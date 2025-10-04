import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageScreen } from '../screens/LanguageScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { UpdatingNamesScreen} from '../screens/UpdatingNamesScreen';
import {UpdatingDOBScreen}  from '../screens/UpdatingDOBScreen';

export type RootStackParamList = {
  Language: undefined;
  Register: { lang: 'en' | 'sw' };
  Login: { lang: 'en' | 'sw' };
  ProfileSetUp: { lang: 'en' | 'sw' };
  UpdatingNames: { lang: 'en' | 'sw'; userId: string };
  UpdatingDOB: { lang: 'en' | 'sw'; userId: string };
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
        <Stack.Screen name="UpdatingNames" component={UpdatingNamesScreen} />
        <Stack.Screen name="UpdatingDOB" component={UpdatingDOBScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
