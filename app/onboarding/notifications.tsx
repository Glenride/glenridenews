import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ONBOARDING_STORAGE_KEYS } from '@/constants/onboarding';
import { isMockEnvironment } from '@/utils/environment';

export default function OnboardingNotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [isProcessing, setIsProcessing] = useState(false);

  const persistPreference = useCallback(async (value: string) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEYS.NOTIFICATION_PREFERENCE, value);
    } catch (error) {
      console.warn('Failed to store notification preference', error);
    }
  }, []);

  const goToTopics = useCallback(() => {
    router.replace('/onboarding/topics');
  }, [router]);

  const handleSkip = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await persistPreference('skipped');
    goToTopics();
  }, [goToTopics, isProcessing, persistPreference]);

  const handleEnable = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let granted = false;

      if (isMockEnvironment()) {
        granted = true;
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        granted = status === Notifications.PermissionStatus.GRANTED;
      }

      await persistPreference(granted ? 'granted' : 'denied');
    } catch (error) {
      console.warn('Failed to request notification permissions', error);
    } finally {
      goToTopics();
    }
  }, [goToTopics, persistPreference, isProcessing]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stay in the Know</Text>
        <Text style={styles.subtitle}>
          Enable notifications to get timely highlights when Glenride curates stories you will love.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enable notifications"
          accessibilityHint="Requests permission to send you Glenride News alerts"
          onPress={handleEnable}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.tint, opacity: pressed || isProcessing ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.primaryLabel, { color: palette.background }]}>Enable notifications</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip notifications for now"
          accessibilityHint="You can enable notifications later from settings"
          onPress={handleSkip}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.tint, opacity: pressed || isProcessing ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.secondaryLabel, { color: palette.tint }]}>Maybe later</Text>
        </Pressable>

        {isProcessing && (
          <ActivityIndicator color={palette.tint} accessibilityLiveRegion="polite" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
