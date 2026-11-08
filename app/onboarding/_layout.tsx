import { Redirect, Stack } from 'expo-router';

import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function OnboardingLayout() {
  const { isOnboardingComplete, isLoading } = useOnboardingStatus();
  const isReducedMotion = useReducedMotion();

  if (isLoading) {
    return null;
  }

  if (isOnboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: isReducedMotion ? 'none' : 'slide_from_right',
      }}
    />
  );
}
