import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalenderScreen" />
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="InsightsScreen" />
      <Stack.Screen name="LogEntryScreen" />
      <Stack.Screen name="UserProfileScreen" />
      <Stack.Screen name="NotificationsScreen" />
      <Stack.Screen name="ChangePinScreen" />
      <Stack.Screen name="ArticleDetailScreen" />
      <Stack.Screen name="DeleteAccountScreen" />
    </Stack>
  );
}
