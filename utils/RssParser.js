import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

const DEFAULT_SOURCE = 'Unknown Source';

function normalizeField(field) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    if ('#text' in field) {
      return field['#text'];
    }
    if ('_cdata' in field) {
      return field._cdata;
    }
    if ('_text' in field) {
      return field._text;
    }
  }
  return String(field);
}

function toArticle(item, url, index) {
  const title = normalizeField(item.title) || 'Untitled Article';
  const content =
    normalizeField(item['content:encoded']) || normalizeField(item.content) || normalizeField(item.description);

  const guid = normalizeField(item.guid);
  const link = normalizeField(item.link);
  const id = guid || link || `${url}#${index}`;

  const dateValue = normalizeField(item.pubDate) || normalizeField(item.published) || normalizeField(item.updated);
  const publishDate = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();

  const source = normalizeField(item.source) || DEFAULT_SOURCE;

  return {
    id,
    title,
    content,
    source,
    publishDate,
    url: link || url,
  };
}

export async function parseRssFeed(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`RSS request failed for ${url}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);

    const channelItems = parsed?.rss?.channel?.item;
    const atomItems = parsed?.feed?.entry;

    const itemsArray = Array.isArray(channelItems)
      ? channelItems
      : channelItems
      ? [channelItems]
      : Array.isArray(atomItems)
      ? atomItems
      : atomItems
      ? [atomItems]
      : [];

    return itemsArray.map((item, index) => toArticle(item, url, index)).filter((article) => article.title.trim());
  } catch (error) {
    console.warn(`Failed to parse RSS feed from ${url}:`, error);
    return [];
  }
}
