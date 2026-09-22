const { withAndroidStyles } = require('@expo/config-plugins');

/**
 * Pins the Android app to the light theme.
 *
 * The app ships one palette. `libs/expo/src/theme.ts` is a single light ramp —
 * `values-night/colors.xml` is literally `<resources/>` — and nothing in the JS
 * reads `useColorScheme`. Declaring `Theme.AppCompat.DayNight` anyway told
 * Android the opposite, so on a phone in dark mode every control the *platform*
 * draws (the switches, the native tab bar, the stack header, ripples, text
 * handles) picked up dark-theme colours while every surface React Native draws
 * stayed light. The result looked like each control was disabled, though they
 * all still worked.
 *
 * `forceDarkAllowed=false` covers the other half. Several OEM skins — ColorOS
 * on Oppo and MIUI most of all — ship a "force dark for every app" toggle that
 * repaints the view tree regardless of the theme, which is what reaches the
 * buttons and pills we colour ourselves. Opting out is the only way to refuse
 * it.
 *
 * This is a config plugin rather than a hand edit to `styles.xml` because
 * `expo run:android` re-syncs the native project from the template, and the
 * template's theme is DayNight. An edit made by hand would come back.
 */
const withLightTheme = (config) =>
  withAndroidStyles(config, (cfg) => {
    const appTheme = cfg.modResults.resources.style?.find(
      (style) => style.$.name === 'AppTheme'
    );
    if (!appTheme) return cfg;

    appTheme.$.parent = 'Theme.AppCompat.Light.NoActionBar';
    appTheme.item = (appTheme.item ?? []).filter(
      (item) => item.$.name !== 'android:forceDarkAllowed'
    );
    appTheme.item.push({
      $: { name: 'android:forceDarkAllowed', 'tools:targetApi': '29' },
      _: 'false',
    });
    return cfg;
  });

module.exports = withLightTheme;
