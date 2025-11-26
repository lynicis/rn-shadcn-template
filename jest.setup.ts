import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => 'react-native-reanimated/mock');

// Mock nativewind's cssInterop to be a no-op
jest.mock('nativewind', () => ({
  cssInterop: jest.fn((component: unknown) => component),
  remapProps: jest.fn((component: unknown) => component),
}));
