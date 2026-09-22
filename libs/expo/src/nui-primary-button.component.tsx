import React from 'react';
import { NUIButton } from './nui-button.component';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /**
   * In-flight. Shows a spinner in place of the label and blocks further taps,
   * so a slow request cannot be submitted twice.
   */
  loading?: boolean;
  accessibilityLabel?: string;
};

/**
 * The app's primary call to action.
 *
 * This is now the primary tier of {@link NUIButton}, which owns the tier
 * styling, the loading state and the accessibility wiring. It stays a named
 * export because the auth screens already call it, and because "primary button"
 * is the clearer name at those call sites.
 *
 * Fixes carried over from the original implementation: `disabled` and
 * `accessibilityLabel` used to be accepted and then ignored, so a disabled
 * button still fired `onPress` and screen readers got no label.
 */
export const NUIPrimaryButton: React.FC<Props> = (props) => (
  <NUIButton {...props} variant="primary" />
);
