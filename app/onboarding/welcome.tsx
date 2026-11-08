import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ONBOARDING_STORAGE_KEYS } from '@/constants/onboarding';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const handleContinue = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEYS.WELCOME_SEEN, 'true');
    } catch (error) {
      console.warn('Failed to persist welcome screen progress', error);
    }

    router.push('/onboarding/notifications');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text
          style={[styles.logoText, { color: palette.tint }]}
          accessibilityRole="header"
        >
          Glenride News
        </Text>
        <Text style={styles.title} accessibilityLabel="Glenride News slogan">
          Glenride News: Curated Clarity. Your world, sorted.
        </Text>
        <Text style={styles.subtitle}>
          Dive into a single destination for the headlines that matter, tailored to your global
          interests.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to notification preferences"
        onPress={handleContinue}
        style={({ pressed }) => [
          [styles.primaryButton, { backgroundColor: palette.tint }],
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: palette.background }]}>Continue</Text>
      </Pressable>
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
    gap: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.light.tint,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
