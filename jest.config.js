module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['packages/**/src/**/*.{ts,tsx,js,jsx}', 'packages/**/!src/**/*.d.ts'],
  moduleNameMapper: {
    '@root-test': '<rootDir>/test',
  },
}
