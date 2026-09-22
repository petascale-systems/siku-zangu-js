import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { NUIFormField } from '../nui-form-field.component';
import { NUIInputField } from '../nui-input-field.component';

/**
 * The app is light-only, on purpose.
 *
 * `apps/app-sikuzangu-org/plugins/with-light-theme.js` explains the native half
 * — a DayNight Android theme made every platform-drawn control pick up dark
 * colours while React Native's own surfaces stayed light, so the controls read
 * as disabled. The pins are `userInterfaceStyle: "light"` in app.json,
 * `UIUserInterfaceStyle = Light` in the iOS plist, and an
 * AppCompat.Light parent plus `forceDarkAllowed=false` on Android.
 *
 * Those pins make `useColorScheme()` report light, which in turn makes every
 * appearance-derived value in the tree resolve light. This file covers the
 * surfaces the app can pin *itself*, so they do not silently depend on that.
 */
describe('inputs keep a light keyboard whatever the OS reports', () => {
  it('NUIInputField pins it', () => {
    render(<NUIInputField placeholder="Phone" />);
    expect(screen.getByPlaceholderText('Phone').props.keyboardAppearance).toBe('light');
  });

  it('NUIFormField pins it', () => {
    render(<NUIFormField label="Phone" testID="i" />);
    expect(screen.getByTestId('i').props.keyboardAppearance).toBe('light');
  });
});
