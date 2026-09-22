import { Platform } from 'react-native';
import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

/**
 * The standard gutter below the last element of a page.
 *
 * One value for the whole app: screens previously ended in 40, 24 or nothing
 * at all, so the amount of room under the final control changed as you moved
 * between them.
 */
export const PAGE_BOTTOM_PADDING = 32;

/** Approximate `UITabBar` / `BottomNavigationView` height, excluding safe area. */
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 56, default: 56 });

/**
 * Bottom padding so a scroll view's last item clears the tab bar.
 *
 * On iOS this is zero, and deliberately so. `NativeTabs` renders a real
 * `UITabBarController`, which extends each child's safe area to cover the tab
 * bar and the home indicator; a `ScrollView` with
 * `contentInsetAdjustmentBehavior="automatic"` then insets its own content to
 * match. Adding padding on top of that produced roughly 83pt of dead space
 * below the last card. Let UIKit do it — it is the only thing that knows the
 * real bar height, and it stays right when the bar is hidden or resized.
 *
 * Android has no equivalent adjustment, so the measurement stands there. The
 * safe-area inset is added rather than assumed, so a device with gesture
 * navigation gets more room than one with hardware keys.
 *
 * Callers must still set `contentInsetAdjustmentBehavior="automatic"`; without
 * it iOS now pads nothing and the last item goes back under the bar.
 *
 * `extra` defaults to the standard page gutter, so a tab screen gets the bar,
 * the safe area and the same bottom breathing room as every other page.
 */
export function useTabContentInset(extra = PAGE_BOTTOM_PADDING): number {
  // Reads the context directly rather than useSafeAreaInsets(), which throws
  // when the context is null. Layout padding is not worth crashing a screen
  // over: fall back to no inset and let the next layout pass correct it.
  const insets = useContext(SafeAreaInsetsContext);
  if (Platform.OS === 'ios') return extra;
  return TAB_BAR_HEIGHT + (insets?.bottom ?? 0) + extra;
}
