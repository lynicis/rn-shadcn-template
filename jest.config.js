/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-reanimated|react-native-css-interop|@react-navigation|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo-.*|@unimodules/.*|unimodules-.*|sentry-expo|native-base|@rn-primitives|class-variance-authority|clsx|tailwind-merge|lucide-react-native|nativewind)/)',
  ],
};
