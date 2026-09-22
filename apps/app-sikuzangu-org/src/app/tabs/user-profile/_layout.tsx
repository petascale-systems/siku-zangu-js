import { Stack } from 'expo-router';
import { colors, typography, useTranslate } from '@siku-zangu/expo';

/**
 * The Profile tab and the settings screens reached from it.
 *
 * A Stack nested inside the native tab keeps the tab bar on screen while these
 * push over it, which is what iOS and Android both do for settings detail.
 * They were previously `hidden` triggers on the tab navigator, which cannot be
 * focused at all: navigating to one threw in development and silently fell
 * back to the first tab in production, so none of them could be opened.
 *
 * The header lives here rather than in each screen. All four hand-rolled the
 * same row — a back chevron, a centred title, a spacer to balance it — which
 * meant four copies of the same layout, no swipe-back, and a back arrow
 * hardcoded to black on every one. The platform header gives us the real back
 * button, the gesture and the correct tint for free.
 */
export default function UserProfileLayout() {
  const t = useTranslate();


  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // Chevron only, no label.
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTintColor: colors.brand.text,
        headerStyle: { backgroundColor: colors.surface.card },
        headerTitleStyle: {
          ...typography.headingSm,
          color: colors.text.primary,
        },
        // The tab bar is already the root of this tab; pushed screens get the
        // standard platform slide rather than a modal presentation.
        headerTitleAlign: 'center',
      }}
    >
      {/* The tab root draws its own header, so it opts out. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="language"
        options={{ title: t('profile.changeLanguage') }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: t('profile.notifications') }}
      />
      <Stack.Screen
        name="change-pin"
        options={{ title: t('profile.changePin') }}
      />
      <Stack.Screen
        name="updating-personal-info"
        options={{ title: t('profile.updatePersonalInfo') }}
      />
      <Stack.Screen
        name="delete-account"
        options={{ title: t('profile.deleteAccount') }}
      />
    </Stack>
  );
}
