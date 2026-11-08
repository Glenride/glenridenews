import { parseRssFeed } from '@/utils/RssParser';

const DEFAULT_RSS_URLS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://www.espn.com/espn/rss/news',
  'https://www.sciencedaily.com/rss/top/science.xml',
];

const MOCK_API_ARTICLES = [
  {
    id: 'mock-api-1',
    title: 'Glenride Daily Brief: Global stories at a glance',
    summary: 'A curated overview of the geopolitical and tech headlines influencing markets today.',
    topic: 'Politics',
    source: 'Glenride Editorial',
    publishDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    url: 'https://glenride.news/politics/daily-brief',
  },
  {
    id: 'mock-api-2',
    title: 'Health innovations pushing longevity forward',
    summary: 'From preventative medicine to AI-assisted diagnostics, see what’s redefining wellness.',
    topic: 'Health',
    source: 'Glenride Health',
    publishDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    url: 'https://glenride.news/health/longevity',
  },
  {
    id: 'mock-api-3',
    title: 'Clean energy investments surge amid policy shifts',
    summary: 'Funding for sustainable infrastructure is accelerating, driven by regulatory momentum.',
    topic: 'Climate',
    source: 'Glenride Business Desk',
    publishDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    url: 'https://glenride.news/climate/clean-energy-investments',
  },
];

const MOCK_TOP_STORIES = [
  {
    id: 'top-1',
    title: 'Breaking: Market rally extends into late session',
    summary: 'Investors digest central bank remarks as equities push higher.',
    topic: 'Finance',
    source: 'Global Wire',
    publishDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    url: 'https://glenride.news/finance/market-rally',
  },
  {
    id: 'top-2',
    title: 'Travel corridors expand for holiday season',
    summary: 'Several regions loosen restrictions, opening fresh opportunities for tourism.',
    topic: 'Travel',
    source: 'WorldWatch',
    publishDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    url: 'https://glenride.news/travel/corridors-expand',
  },
];

const KEYWORD_TOPIC_MAP = [
  { keyword: 'tech', topic: 'Tech' },
  { keyword: 'ai', topic: 'Tech' },
  { keyword: 'science', topic: 'Science' },
  { keyword: 'health', topic: 'Health' },
  { keyword: 'sport', topic: 'Sports' },
  { keyword: 'climate', topic: 'Climate' },
  { keyword: 'finance', topic: 'Finance' },
  { keyword: 'business', topic: 'Business' },
  { keyword: 'politic', topic: 'Politics' },
  { keyword: 'travel', topic: 'Travel' },
];

function inferTopic(title, fallbackTopics) {
  const lower = title.toLowerCase();
  for (const { keyword, topic } of KEYWORD_TOPIC_MAP) {
    if (lower.includes(keyword)) {
      return topic;
    }
  }
  return fallbackTopics?.[0] ?? 'General';
}

function normaliseArticle(article, fallbackTopics) {
  const topic = article.topic || inferTopic(article.title, fallbackTopics);
  return {
    id: article.id,
    title: article.title,
    summary: article.summary || article.content || '',
    topic,
    source: article.source || 'Unknown Source',
    publishDate: article.publishDate || new Date().toISOString(),
    url: article.url,
    origin: article.origin || 'rss',
  };
}

function normaliseRssArticles(rssArticles, fallbackTopics) {
  return rssArticles.map((article, index) =>
    normaliseArticle(
      {
        ...article,
        id: article.id || `${article.url}#${index}`,
        summary: article.content,
        origin: 'rss',
      },
      fallbackTopics,
    ),
  );
}

function normaliseApiArticles(apiArticles) {
  return apiArticles.map((article) =>
    normaliseArticle(
      {
        ...article,
        origin: 'api',
      },
      [article.topic],
    ),
  );
}

function blendArticles(personalised, topStories) {
  const sortedPersonalised = [...personalised].sort((a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );
  const sortedTop = [...topStories].sort((a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );

  const totalPool = sortedPersonalised.length + sortedTop.length;
  if (totalPool === 0) {
    return [];
  }

  const maxItems = Math.min(totalPool, 30);
  const personalisedTarget = Math.min(sortedPersonalised.length, Math.round(maxItems * 0.7));
  const topTarget = Math.min(sortedTop.length, maxItems - personalisedTarget);

  const blended = [];

  for (let i = 0; i < personalisedTarget; i += 1) {
    blended.push(sortedPersonalised[i]);
  }

  for (let i = 0; i < topTarget; i += 1) {
    blended.push(sortedTop[i]);
  }

  return blended.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );
}

export async function fetchMainFeed({ topics = [], rssUrls = DEFAULT_RSS_URLS } = {}) {
  const topicArray = Array.isArray(topics) ? topics : [topics];
  const topicSet = new Set(topicArray.map((topic) => topic.toLowerCase()));

  const rssResults = await Promise.allSettled(rssUrls.map((url) => parseRssFeed(url)));
  const rssArticles = rssResults
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .map((article, index) => ({ ...article, id: article.id || `rss-${index}` }));

  const personalisedRss = normaliseRssArticles(
    rssArticles.filter((article) => {
      if (topicSet.size === 0) return true;
      const inferredTopic = inferTopic(article.title, topicArray);
      return topicSet.has(inferredTopic.toLowerCase());
    }),
    topicArray,
  );

  const personalisedApi = normaliseApiArticles(
    MOCK_API_ARTICLES.filter((article) => {
      if (topicSet.size === 0) return true;
      return topicSet.has(article.topic.toLowerCase());
    }),
  );

  const personalised = [...personalisedRss, ...personalisedApi];
  const topStories = normaliseApiArticles(MOCK_TOP_STORIES);

  const blended = blendArticles(personalised, topStories);

  const fallbackPool = normaliseRssArticles(rssArticles, topicArray);
  const uniqueIds = new Set(blended.map((article) => article.id));

  for (const article of fallbackPool) {
    if (uniqueIds.size >= 30) break;
    if (!uniqueIds.has(article.id)) {
      uniqueIds.add(article.id);
      blended.push(article);
    }
  }

  return blended.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

export const DEFAULT_CUSTOM_SOURCES = DEFAULT_RSS_URLS;
