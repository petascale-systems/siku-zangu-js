import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageScreen } from '../screens/LanguageScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { UpdatingNamesScreen} from '../screens/UpdatingNamesScreen';
import {UpdatingDOBScreen}  from '../screens/UpdatingDOBScreen';
import {UpdatingPeriodScreen} from '../screens/UpdatingPeriodScreen';
import {UpdatingPeriodLengthScreen} from '../screens/UpdatingPeriodLengthScreen';
import {UpdatingCycleLengthScreen} from '../screens/UpdatingCycleLengthScreen';
import {UpdatingSymptomsMoodsScreen} from '../screens/UpdatingSymptomsMoodsScreen';
import {UpdatingMedicationScreen} from '../screens/UpdatingMedicationScreen';
import {CalenderScreen } from '../screens/CalenderScreen';
import {InsightsScreen} from '../screens/InsightsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {LogEntryScreen} from '../screens/LogEntryScreen';

export type RootStackParamList = {
  Language: undefined;
  Register: { lang: 'en' | 'sw' };
  Login: { lang: 'en' | 'sw' };
  ProfileSetUp: { lang: 'en' | 'sw' };
  UpdatingNames: { lang: 'en' | 'sw'; userId: string };
  UpdatingDOB: { lang: 'en' | 'sw'; userId: string };
  UpdatingPeriod: {lang: 'en' | 'sw'; userId: string};
  UpdatingPeriodLength: {lang: 'en' | 'sw'; userId: string};
  UpdatingCycleLength: {lang: 'en' | 'sw'; userId: string};
  UpdatingSymptomsMoods: {lang: 'en' | 'sw'; userId: string};
  UpdatingMedication: {lang: 'en' | 'sw'; userId: string};
  Calender: {lang: 'en' | 'sw'; userId: string};
  Insights: {lang: 'en' | 'sw'; userId: string};
  Dashboard: {lang: 'en' | 'sw'; userId: string};
  AddLog: {lang: 'en' | 'sw'; userId: string};
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
        <Stack.Screen name="UpdatingPeriod" component={UpdatingPeriodScreen}/>
        <Stack.Screen name="UpdatingPeriodLength" component={UpdatingPeriodLengthScreen}/>
        <Stack.Screen name="UpdatingCycleLength" component={UpdatingCycleLengthScreen}/>
        <Stack.Screen name="UpdatingSymptomsMoods" component={UpdatingSymptomsMoodsScreen}/>
        <Stack.Screen name="UpdatingMedication" component={UpdatingMedicationScreen}/>
        <Stack.Screen name="Calender" component={CalenderScreen} />
        <Stack.Screen name="Insights" component={InsightsScreen} />
        <Stack.Screen name="Dashboard" component={HomeScreen}/>
        <Stack.Screen name="AddLog" component={LogEntryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
