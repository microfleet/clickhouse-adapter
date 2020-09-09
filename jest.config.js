module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['packages/**/src/**/*.{ts,tsx,js,jsx}', 'packages/**/!src/**/*.d.ts'],
  coverageReporters: ['text-summary', 'json', 'lcov'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '@root-test': '<rootDir>/test',
  },
}
