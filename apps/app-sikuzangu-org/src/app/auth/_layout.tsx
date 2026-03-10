import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="Forgotpinscreen" />
        <Stack.Screen name="Resetpinscreen" />
        <Stack.Screen name="Verifyotpscreen" />
    </Stack>
  );
}
