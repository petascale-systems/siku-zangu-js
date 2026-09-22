/**
 * Jest config for libs/knex.
 *
 * A `.js` file, not `.ts`: the installed jest/ts-node pair cannot parse a TS
 * config ("state.conditions.includes is not a function") and the suite silently
 * never runs — the same trap libs/react and libs/expo already hit.
 *
 * Node environment, and the specs here cover pure functions only. There is no
 * database in CI, so the SQL itself is verified by hand against a scratch DB.
 */
module.exports = {
  displayName: 'knex',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/knex',
};
