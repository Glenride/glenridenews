import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
  MIN_TOPIC_SELECTION,
  ONBOARDING_STORAGE_KEYS,
  TOPIC_OPTIONS,
} from '@/constants/onboarding';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

type TopicItemProps = {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  tintColor: string;
  textColor: string;
};

function TopicItem({ label, isSelected, onToggle, tintColor, textColor }: TopicItemProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`Select ${label} news`}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.topicChip,
        {
          backgroundColor: isSelected ? tintColor : undefined,
          borderColor: tintColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.topicLabel,
          { color: isSelected ? textColor : tintColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function OnboardingTopicsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { markOnboardingComplete } = useOnboardingStatus();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadExisting = async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEYS.TOPIC_SELECTION);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSelectedTopics(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load previously selected topics', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadExisting();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]
    );
  }, []);

  const isSelectionValid = selectedTopics.length >= MIN_TOPIC_SELECTION;

  const handleContinue = useCallback(async () => {
    if (!isSelectionValid || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEYS.TOPIC_SELECTION,
        JSON.stringify(selectedTopics),
      );
      await markOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error) {
      console.warn('Failed to save selected topics', error);
      setIsSaving(false);
    }
  }, [isSelectionValid, isSaving, markOnboardingComplete, router, selectedTopics]);

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item }) => (
      <TopicItem
        label={item}
        isSelected={selectedTopics.includes(item)}
        onToggle={() => toggleTopic(item)}
        tintColor={palette.tint}
        textColor={palette.background}
      />
    ),
    [palette.background, palette.tint, selectedTopics, toggleTopic]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const remainingCount = useMemo(
    () => Math.max(0, MIN_TOPIC_SELECTION - selectedTopics.length),
    [selectedTopics.length],
  );
    selectedTopics.length,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={palette.tint} size="large" accessibilityRole="progressbar" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customize Your Feed</Text>
        <Text style={styles.subtitle}>Select at least 5 topics to start your journey.</Text>
      </View>

      <RNView style={styles.listWrapper}>
        <FlatList
          data={TOPIC_OPTIONS}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </RNView>

      <View style={styles.footer}>
        {!isSelectionValid && (
          <Text style={styles.helperText} accessibilityLiveRegion="polite">
            Select {remainingCount} more topic{remainingCount === 1 ? '' : 's'} to continue.
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isSelectionValid || isSaving }}
          accessibilityLabel="Save your topics and view your main feed"
          onPress={handleContinue}
          disabled={!isSelectionValid || isSaving}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: palette.tint,
              opacity: !isSelectionValid || isSaving ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={palette.background} />
          ) : (
            <Text style={[styles.buttonLabel, { color: palette.background }]}>Continue</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
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
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  topicChip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topicLabel: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    gap: 16,
  },
  helperText: {
    fontSize: 14,
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
