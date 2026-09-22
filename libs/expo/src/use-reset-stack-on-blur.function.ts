import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * Pops this screen's stack back to its root once the screen is navigated away
 * from, so re-entering the tab starts at the tab's own screen rather than
 * wherever it was last left.
 *
 * Call it from a screen inside the stack, never from the `_layout` that
 * renders it. A layout component is a screen of the *parent* navigator, so its
 * `useNavigation()` is the tab navigator — dispatching a stack action there
 * produces "The action POP_TO_TOP was not handled by any navigator".
 *
 * The state is checked before dispatching rather than assumed, so this is inert
 * on a screen that turns out not to be in a stack.
 */
export function useResetStackOnBlur(): void {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(
      () => () => {
        const state = navigation.getState?.();
        if (state?.type !== 'stack') return;
        if (state.routes.length <= 1) return;
        if (!navigation.canGoBack?.()) return;
        (navigation as { popToTop?: () => void }).popToTop?.();
      },
      [navigation]
    )
  );
}
