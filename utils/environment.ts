export function isMockEnvironment() {
  const envFlag = process.env.EXPO_PUBLIC_MOCK_ENV;

  if (typeof envFlag === 'string') {
    return envFlag.toLowerCase() === 'true';
  }

  // Default to mock behaviour in development builds.
  return __DEV__;
}
