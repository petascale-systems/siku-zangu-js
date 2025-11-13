import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="updating-names" />
      <Stack.Screen name="updating-dob" />
      <Stack.Screen name="updating-period" />
      <Stack.Screen name="updating-period-length" />
      <Stack.Screen name="updating-cycle-length" />
      <Stack.Screen name="updating-symptoms-moods" />
      <Stack.Screen name="updating-medication" />
    </Stack>
  );
}