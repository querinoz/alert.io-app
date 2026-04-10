module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        module: 'commonjs',
        moduleResolution: 'node',
        strict: false,
        skipLibCheck: true,
        noEmit: true,
      },
    }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.ts',
    '^expo-haptics$': '<rootDir>/__tests__/__mocks__/expo-haptics.ts',
    '^@expo/vector-icons$': '<rootDir>/__tests__/__mocks__/expo-vector-icons.ts',
    '^expo-router$': '<rootDir>/__tests__/__mocks__/expo-router.ts',
    '\\.svg$': '<rootDir>/__tests__/__mocks__/svg.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  verbose: true,
};
