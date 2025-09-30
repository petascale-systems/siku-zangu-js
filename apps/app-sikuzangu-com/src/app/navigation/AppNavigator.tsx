import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {LanguageScreen} from "../screens/LanguageScreen";
import {RegisterScreen} from "../screens/RegisterScreen"

export type RootStackParamList ={
    Language:undefined;
    Register:{lang:'en'| 'swa'};
};

const Stack=createNativeStackNavigator<RootStackParamList>();

export const AppNavigator =()=>{
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Language" screenOptions={{ headerShown: false}}>
                <Stack.Screen name="Language" component={LanguageScreen}/>
                 <Stack.Screen name="Register" component={RegisterScreen}/>
                
            </Stack.Navigator>
        </NavigationContainer>
    );
};
