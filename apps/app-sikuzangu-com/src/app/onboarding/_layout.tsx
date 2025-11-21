import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UpdatingNamesScreen" />
            <Stack.Screen name="UpdatingDobScreen" />
            <Stack.Screen name="UpdatingPeriodScreen" />
            <Stack.Screen name="UpdatingPeriodLengthScreen" />
            <Stack.Screen name="UpdatingCycleLengthScreen" />
            <Stack.Screen name="UpdatingSymptomsMoodsScreen" />
            <Stack.Screen name="UpdatingMedicationScreen" />
        </Stack>
    );
}