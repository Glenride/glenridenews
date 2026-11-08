import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ONBOARDING_STORAGE_KEYS } from '@/constants/onboarding';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function OnboardingIndex() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { isLoading, isOnboardingComplete } = useOnboardingStatus();
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveRoute = async () => {
      if (isLoading) {
        return;
      }

      if (isOnboardingComplete) {
        router.replace('/(tabs)');
        return;
      }

      try {
        const [welcomeSeen, notificationPreference, topics] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEYS.WELCOME_SEEN),
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEYS.NOTIFICATION_PREFERENCE),
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEYS.TOPIC_SELECTION),
        ]);

        if (!isMounted) {
          return;
        }

        if (!welcomeSeen) {
          router.replace('/onboarding/welcome');
        } else if (!notificationPreference) {
          router.replace('/onboarding/notifications');
        } else if (!topics) {
          router.replace('/onboarding/topics');
        } else {
          // Fallback: mark onboarding as complete if all steps are satisfied but flag wasn't set.
          router.replace('/(tabs)');
        }
      } finally {
        if (isMounted) {
          setIsResolving(false);
        }
      }
    };

    resolveRoute();

    return () => {
      isMounted = false;
    };
  }, [isLoading, isOnboardingComplete, router]);

  if (!isResolving) {
    return null;
  }

  return (
    <View style={styles.loader}>
      <ActivityIndicator color={palette.tint} size="large" accessibilityRole="progressbar" />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
