import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { colors, useTranslate } from '@siku-zangu/expo';

/**
 * Platform-native bottom tabs.
 *
 * This renders a real `UITabBarController` on iOS and `BottomNavigationView` on
 * Android, so the bar gets the system look, blur and behaviour for free —
 * including the iOS scroll-edge appearance and accessibility semantics.
 *
 * Two earlier versions were worse:
 *  - A `Stack` with a hand-rolled bar drawn inside every screen. Tapping a
 *    "tab" pushed a new screen, so the back stack grew forever and each tab
 *    lost its scroll position.
 *  - `expo-router`'s `<Tabs>`, which is React Navigation's JS tab bar. It looks
 *    close, but it is Views drawn by React Native, not the platform control.
 *
 * Icons are SF Symbols on iOS, with Android falling back to the drawable name.
 *
 * Only real tabs live here. `hidden` does NOT mean "routable but off the bar":
 * expo-router treats a hidden route as one that cannot be focused, so
 * navigating to it throws in development and silently snaps back to the first
 * visible tab in production. Detail and settings screens are therefore root
 * Stack routes that push over the bar, not hidden triggers.
 */
export default function TabsLayout() {
  const t = useTranslate();

  return (
    <NativeTabs
      tintColor={colors.nav.active}
      // Active vs inactive are separated by luminance, not just hue — see
      // colors.nav. The SF Symbols also swap outline/filled, so selection is
      // never carried by colour alone.
      // iOS gives UITabBar two appearances: transparent at a scroll edge and
      // opaque once content passes under it. With an explicit backgroundColor
      // the bar flipped between that colour and the cream screen showing
      // through, so it looked like it changed colour per screen. Pinning the
      // edge appearance keeps one consistent bar, and leaving the background
      // to the system keeps the native material rather than a flat fill.
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="home">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="ic_menu_home" />
        <Label>{t('tabs.home')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          drawable="ic_menu_my_calendar"
        />
        <Label>{t('tabs.calendar')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="log-entry">
        <Icon
          sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }}
          drawable="ic_input_add"
        />
        <Label>{t('tabs.log')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <Icon
          sf={{ default: 'lightbulb', selected: 'lightbulb.fill' }}
          drawable="ic_menu_info_details"
        />
        <Label>{t('tabs.insights')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="user-profile">
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          drawable="ic_menu_myplaces"
        />
        <Label>{t('tabs.profile')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
