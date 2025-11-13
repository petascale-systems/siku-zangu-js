import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalenderScreen" />
      <Stack.Screen name="InsightsScreen" />
      <Stack.Screen name="ArticleDetailScreen" />
    </Stack>
  );
}