import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/utils/Analytics';

const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'AI Knowledge Transforms Global Technology',
    summary:
      'Explore how artificial intelligence is reshaping industries and creating new opportunities worldwide.',
    author: 'Glenride Editorial',
    publishedAt: '2h ago',
    topic: 'Technology',
    content:
      'Artificial intelligence is driving the next wave of innovation, from healthcare diagnostics to smart supply chains. Glenride News curates the most relevant breakthroughs so you stay ahead without endless scrolling. Expect balanced analysis, trusted sourcing, and context you can rely on.',
  },
  {
    id: '2',
    title: 'Global Markets Surge on Economic Recovery',
    summary:
      'Markets respond positively as recovery signals spread across multiple regions and sectors.',
    author: 'Glenride Markets Desk',
    publishedAt: '4h ago',
    topic: 'Finance',
    content:
      'Investors welcomed a wave of optimistic economic data today. With Glenride News, you can track the trends that matter most to your portfolio, blending curated sources and your personal interests for a tailored feed.',
  },
];

function findArticleById(id?: string | string[]) {
  if (!id) return undefined;
  const key = Array.isArray(id) ? id[0] : id;
  return MOCK_ARTICLES.find((article) => article.id === key);
}

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const article = useMemo(() => findArticleById(params.id), [params.id]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!article) {
      router.replace('/(tabs)');
    }
  }, [article, router]);

  useEffect(() => {
    if (userToken) {
      setShowLoginPrompt(false);
    }
  }, [userToken]);

  const handleSaveArticle = () => {
    if (!article) return;

    if (!userToken) {
      setShowLoginPrompt(true);
      return;
    }

    setFeedbackMessage('Article saved to your Glenride Reads.');
    trackEvent('article_saved', {
      articleId: article.id,
      topic: article.topic,
      source: article.source,
    });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handlePromptLogin = () => {
    if (!article) return;

    setShowLoginPrompt(false);
    router.push({
      pathname: '/auth/login',
      params: { redirect: `/article/${article.id}` },
    });
  };

  if (!article) {
    return null;
  }

  return (
    <RNView style={styles.flex}>
      {showLoginPrompt && (
        <View
          style={[styles.promptBanner, { backgroundColor: palette.card, borderColor: palette.tint }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.promptText}>Please log in or sign up to save articles.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log in to save articles"
            onPress={handlePromptLogin}
            style={({ pressed }) => [
              styles.promptButton,
              { backgroundColor: palette.tint, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.promptButtonLabel, { color: palette.background }]}>Log in</Text>
          </Pressable>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.topicTag}>{article.topic}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>
            {article.author} • {article.publishedAt}
          </Text>
        </View>

        <Text style={styles.summary}>{article.summary}</Text>
        <Text style={styles.body}>{article.content}</Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: palette.border, backgroundColor: palette.card }]}>
        {feedbackMessage ? (
          <Text style={[styles.feedback, { color: palette.tint }]} accessibilityLiveRegion="polite">
            {feedbackMessage}
          </Text>
        ) : (
          <Text style={styles.placeholder}>Tap save to keep this story in your Glenride Reads.</Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save this article"
          onPress={handleSaveArticle}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: palette.tint, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.saveLabel, { color: palette.background }]}>Save Article</Text>
        </Pressable>
      </View>
    </RNView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  topicTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E5EA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  meta: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  feedback: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  promptBanner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  promptButton: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
