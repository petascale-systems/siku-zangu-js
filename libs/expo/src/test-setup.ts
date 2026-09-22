/**
 * Jest setup for libs/expo.
 *
 * Referenced by `jest.config.ts` but previously missing, so the suite could not
 * start at all.
 */
// @testing-library/react-native v13 registers its matchers on import.
// AsyncStorage is native; the language provider reads it on mount.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-localization reaches into native locale APIs.
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));

// @expo/vector-icons ships untranspiled TypeScript, which the react-native
// preset does not transform, so importing it fails the whole suite with
// "Cannot use import statement outside a module". Each family renders as a
// Text node carrying its icon name, which is enough to assert on.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const makeFamily = (family: string) => {
    const Icon = ({ name, ...rest }: { name: string }) =>
      React.createElement(
        Text,
        { ...rest, testID: `icon-${name}` },
        `${family}:${name}`
      );
    Icon.displayName = family;
    return Icon;
  };
  return {
    __esModule: true,
    Ionicons: makeFamily('Ionicons'),
    MaterialIcons: makeFamily('MaterialIcons'),
    MaterialCommunityIcons: makeFamily('MaterialCommunityIcons'),
    FontAwesome: makeFamily('FontAwesome'),
    FontAwesome5: makeFamily('FontAwesome5'),
    Feather: makeFamily('Feather'),
    AntDesign: makeFamily('AntDesign'),
    Entypo: makeFamily('Entypo'),
  };
});
