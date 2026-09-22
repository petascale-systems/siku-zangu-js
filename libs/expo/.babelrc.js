/**
 * Babel config for libs/expo's Jest suite.
 *
 * This previously returned an empty config, so babel-jest had no presets and
 * could not parse React Native's Flow-typed internals — the suite failed before
 * running a single test.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
  };
};
