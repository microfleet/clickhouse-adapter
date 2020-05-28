module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['packages/**/src/**/*.{ts,tsx,js,jsx}', 'packages/**/!src/**/*.d.ts'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '@root-test': '<rootDir>/test',
  },
}
