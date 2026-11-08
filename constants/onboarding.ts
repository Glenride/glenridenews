export const ONBOARDING_STORAGE_KEYS = {
  WELCOME_SEEN: '@glenride/onboarding:welcomeSeen',
  NOTIFICATION_PREFERENCE: '@glenride/onboarding:notifications',
  TOPIC_SELECTION: '@glenride/initialInterests',
} as const;

export const MIN_TOPIC_SELECTION = 5;

export const TOPIC_OPTIONS = [
  'Tech',
  'Politics',
  'Sports',
  'Windsurf',
  'Business',
  'Health',
  'Culture',
  'Science',
  'Entertainment',
  'Climate',
  'Finance',
  'Travel',
  'World',
  'Innovation',
];
