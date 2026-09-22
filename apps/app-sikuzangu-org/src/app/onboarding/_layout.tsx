import { Stack } from 'expo-router';
import { colors } from '@siku-zangu/expo';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        // The platform back control: a real chevron with the system's
        // swipe-back gesture, replacing the hand-rolled arrow each screen drew.
        //
        // NOT `headerTransparent`. A transparent header floats at y=0, and
        // Android has been edge-to-edge since SDK 54 (enforced outright at
        // targetSdkVersion 36), so the window extends under the status bar and
        // the camera cutout — which put the chevron behind the camera. Giving
        // the header the screen's own background colour costs nothing visually,
        // because it is the same colour, but it makes the bar occupy real
        // layout space so the platform applies the status-bar and cutout inset
        // to it, and the screen's content starts below both.
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface.app },
        headerShadowVisible: false,
        headerTitle: '',
        // Chevron only, no label.
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTintColor: colors.brand.text,
      }}
    >
      <Stack.Screen name="updating-names" options={{ headerShown: false }} />
      <Stack.Screen name="updating-dob" />
      <Stack.Screen name="updating-period" />
      <Stack.Screen name="updating-period-length" />
      <Stack.Screen name="updating-cycle-length" />
      <Stack.Screen name="updating-symptoms-moods" />
      <Stack.Screen name="updating-medication" />
    </Stack>
  );
}
