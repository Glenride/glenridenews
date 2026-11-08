import { Stack } from 'expo-router';

import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function AuthLayout() {
  const isReducedMotion = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: isReducedMotion ? 'none' : 'slide_from_bottom',
      }}
    />
  );
}
