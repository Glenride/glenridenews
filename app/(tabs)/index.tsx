import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { ONBOARDING_STORAGE_KEYS } from '@/constants/onboarding';
import { SOURCE_STORAGE_KEYS } from '@/constants/sources';
import { fetchMainFeed, DEFAULT_CUSTOM_SOURCES } from '@/services/NewsService';

const TOP_TABS = ['Discover', 'Monitoring', 'Trending'];
const TOPIC_FILTERS = ['Technology', 'Business', 'Sports', 'Politics', 'Science', 'Health'];

export default function MainFeedScreen() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [topicJson, customSourcesJson] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_STORAGE_KEYS.TOPIC_SELECTION),
        AsyncStorage.getItem(SOURCE_STORAGE_KEYS.CUSTOM_SOURCES),
      ]);

      const topics = topicJson ? JSON.parse(topicJson) : [];
      const customSources = customSourcesJson ? JSON.parse(customSourcesJson) : [];

      const rssUrls = [...DEFAULT_CUSTOM_SOURCES, ...customSources];
      const feed = await fetchMainFeed({ topics, rssUrls });
      setArticles(feed);
    } catch (error) {
      console.warn('Failed to load main feed', error);
      setErrorMessage('We had trouble fetching your feed. Pull to refresh or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed]),
  );

  const heroArticle = useMemo(() => articles[0], [articles]);
  const remainingArticles = useMemo(() => articles.slice(1), [articles]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>Glenride News</Text>
          <View style={styles.searchPlaceholder}>
            <Text style={styles.searchText}>Search insights</Text>
          </View>
        </View>

        <RNView style={styles.segmentRow}>
          {TOP_TABS.map((tab, index) => (
            <View key={tab} style={[styles.segmentItem, index === 0 && styles.segmentActive]}>
              <Text style={[styles.segmentLabel, index === 0 && styles.segmentLabelActive]}>{tab}</Text>
            </View>
          ))}
        </RNView>

        <RNView style={styles.filterRow}>
          {TOPIC_FILTERS.map((topic, index) => (
            <View
              key={topic}
              style={[styles.filterChip, index === 0 && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{topic}</Text>
            </View>
          ))}
        </RNView>

        {heroArticle ? (
          <Link href={{ pathname: '/article/[id]', params: { id: heroArticle.id } }} asChild>
            <Pressable style={styles.heroCard} accessibilityRole="button">
              <Text style={styles.heroBadge}>{heroArticle.topic}</Text>
              <Text style={styles.heroTitle}>{heroArticle.title}</Text>
              <Text style={styles.heroSummary} numberOfLines={2}>
                {heroArticle.summary}
              </Text>
              <Text style={styles.heroButton}>Read Story</Text>
            </Pressable>
          </Link>
        ) : (
          <View style={styles.heroCardPlaceholder}>
            <Text style={styles.heroBadge}>Loading Headlines...</Text>
            <Text style={styles.heroTitle}>Curating stories for you</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#E97451" accessibilityRole="progressbar" />
          </View>
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <View style={styles.feedGrid}>
            {remainingArticles.map((article) => (
              <Link
                key={article.id}
                href={{ pathname: '/article/[id]', params: { id: article.id } }}
                asChild
              >
                <Pressable style={styles.card} accessibilityRole="button">
                  <View style={styles.cardImagePlaceholder} />
                  <Text style={styles.cardBadge}>{article.topic}</Text>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <Text style={styles.cardTeaser} numberOfLines={2}>
                    {article.summary}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {new Date(article.publishDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {` • ${article.source}`}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
  },
  searchPlaceholder: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  searchText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636366',
  },
  segmentLabelActive: {
    color: '#1C1C1E',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  filterChipActive: {
    backgroundColor: '#E97451',
  },
  filterText: {
    fontSize: 13,
    color: '#636366',
  },
  filterTextActive: {
    color: '#fff',
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    gap: 12,
  },
  heroCardPlaceholder: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    gap: 12,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  heroSummary: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  heroButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  feedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  loader: {
    paddingVertical: 32,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardImagePlaceholder: {
    height: 140,
    borderRadius: 14,
    backgroundColor: '#D1D1D6',
  },
  cardBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    color: '#E97451',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardTeaser: {
    fontSize: 14,
    color: '#636366',
  },
  cardMeta: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
