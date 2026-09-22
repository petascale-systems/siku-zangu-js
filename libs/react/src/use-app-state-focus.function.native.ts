import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { focusManager } from '@tanstack/react-query';

/**
 * Feeds React Native's AppState into Query's focus manager.
 *
 * Query assumes the browser's `focus` event, which does not exist here, so
 * without this refetch-on-focus never fires on mobile. Call it once, at the
 * app root, inside `XUIQuery.Provider`.
 *
 * A single listener at the root replaces the per-hook listener the old
 * implementation registered — with several screens mounted, foregrounding the
 * app fired one GET per screen.
 *
 * Connectivity is deliberately not wired: that needs
 * @react-native-community/netinfo, a native module, and adding one forces a
 * native rebuild. Query therefore treats the app as always online.
 */
export function useAppStateFocus(): void {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });
    return () => sub.remove();
  }, []);
}
