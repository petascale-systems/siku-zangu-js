/**
 * Jest config for libs/react (web).
 *
 * Was a .ts file, which the installed jest/ts-node pair cannot parse
 * ("state.conditions.includes is not a function"), so the suite never ran.
 */
module.exports = {
  displayName: 'react',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // These ship ESM only and are required from CommonJS, so they have to be
  // transformed rather than passed through.
  transformIgnorePatterns: [
    'node_modules/(?!(debounce|flowbite-react|@tanstack)/)',
  ],
  coverageDirectory: '../../coverage/libs/react',
};
