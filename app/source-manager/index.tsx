import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { SOURCE_STORAGE_KEYS, DEFAULT_CUSTOM_SOURCE_LIMIT } from '@/constants/sources';

type SourceItem = {
  id: string;
  url: string;
};

export default function SourceManagerScreen() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(SOURCE_STORAGE_KEYS.CUSTOM_SOURCES);
      const list = stored ? JSON.parse(stored) : [];
      setSources(Array.isArray(list) ? list.map((url, index) => ({ id: `${url}-${index}`, url })) : []);
    } catch (error) {
      console.warn('Failed to load custom sources', error);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSources();
    }, [loadSources]),
  );

  const persistSources = useCallback(async (list: SourceItem[]) => {
    const urlsOnly = list.map((item) => item.url);
    await AsyncStorage.setItem(SOURCE_STORAGE_KEYS.CUSTOM_SOURCES, JSON.stringify(urlsOnly));
    setSources(list);
  }, []);

  const handleRemove = useCallback(
    async (id: string) => {
      const filtered = sources.filter((item) => item.id !== id);
      await persistSources(filtered.map((item, index) => ({ ...item, id: `${item.url}-${index}` })));
    },
    [persistSources, sources],
  );

  const handleAdd = useCallback(async () => {
    const trimmed = newUrl.trim();
    if (!trimmed) {
      Alert.alert('Missing URL', 'Add a URL before saving.');
      return;
    }

    if (sources.some((item) => item.url === trimmed)) {
      Alert.alert('Duplicate source', 'This RSS feed is already in your list.');
      return;
    }

    if (sources.length >= DEFAULT_CUSTOM_SOURCE_LIMIT) {
      Alert.alert('Source limit reached', `You can manage up to ${DEFAULT_CUSTOM_SOURCE_LIMIT} custom sources.`);
      return;
    }

    setIsSaving(true);
    try {
      const updated = [...sources, { id: `${trimmed}-${Date.now()}`, url: trimmed }];
      await persistSources(updated);
      setNewUrl('');
      setModalVisible(false);
    } catch (error) {
      console.warn('Failed to add custom source', error);
      Alert.alert('Unable to save', 'Something went wrong while storing this source.');
    } finally {
      setIsSaving(false);
    }
  }, [DEFAULT_CUSTOM_SOURCE_LIMIT, newUrl, persistSources, sources]);

  const renderItem: ListRenderItem<SourceItem> = useCallback(
    ({ item }) => (
      <View style={styles.sourceRow}>
        <Text style={styles.sourceUrl} numberOfLines={1}>
          {item.url}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.url}`}
          onPress={() => handleRemove(item.id)}
          style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.deleteLabel}>Remove</Text>
        </Pressable>
      </View>
    ),
    [handleRemove],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Glenride Sources</Text>
      <Text style={styles.subtitle}>
        Add RSS URLs to blend niche publishers into your Glenride News feed. Total sources are capped to
        keep performance in check.
      </Text>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E97451" />
        </View>
      ) : sources.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No custom sources yet</Text>
          <Text style={styles.emptySubtitle}>Tap “Add New Source” to include your favorite RSS feeds.</Text>
        </View>
      ) : (
        <FlatList
          data={sources}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a custom Glenride Source"
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={styles.addButtonLabel}>Add New Source</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Custom Glenride Source</Text>
            <Text style={styles.modalHint}>Paste the RSS feed URL. We’ll merge it into your personalized feed.</Text>
            <TextInput
              accessibilityLabel="Custom RSS URL"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://example.com/feed"
              value={newUrl}
              onChangeText={setNewUrl}
              style={styles.modalInput}
            />
            <RNView style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setNewUrl('');
                }}
                style={({ pressed }) => [styles.modalSecondary, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.modalSecondaryLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save source"
                onPress={handleAdd}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.modalPrimary,
                  { opacity: isSaving ? 0.6 : pressed ? 0.85 : 1 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalPrimaryLabel}>Save</Text>
                )}
              </Pressable>
            </RNView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#636366',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#636366',
  },
  listContent: {
    gap: 12,
    paddingBottom: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  sourceUrl: {
    flex: 1,
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFECE6',
  },
  deleteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E97451',
  },
  addButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E97451',
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalHint: {
    fontSize: 14,
    color: '#636366',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSecondary: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalSecondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalPrimary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#E97451',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalPrimaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
