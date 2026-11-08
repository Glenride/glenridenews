import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Sources</Text>
        <Link href="/source-manager" asChild>
          <Pressable style={styles.listItem} accessibilityRole="button">
            <View>
              <Text style={styles.listTitle}>Manage Custom Sources</Text>
              <Text style={styles.listSubtitle}>Add or remove RSS feeds used in your main feed.</Text>
            </View>
            <Text style={styles.listChevron}>›</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#636366',
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#636366',
    marginTop: 4,
    maxWidth: 240,
  },
  listChevron: {
    fontSize: 28,
    color: '#C7C7CC',
    marginLeft: 'auto',
  },
});
