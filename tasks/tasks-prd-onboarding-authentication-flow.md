## Relevant Files

- `constants/Colors.ts` - Replace default Expo palette with Glenride brand tokens for light/dark themes.
- `constants/onboarding.ts` - Shared onboarding constants (storage keys, topic list, selection rules).
- `app/_layout.tsx` - Configure root navigation stacks for onboarding, auth, and main app flows.
- `app/(tabs)/_layout.tsx` - Update tab layout and routes to include main feed, settings, and article detail access.
- `app/(tabs)/index.tsx` - Implement the blended main feed consuming personalized topics and top stories.
- `app/(tabs)/settings.tsx` - New settings screen entry point that links to SourceManager.
- `app/onboarding/_layout.tsx` - Stack container for onboarding screens with slide transitions.
- `app/onboarding/index.tsx` - Redirect entry that sends users to the welcome screen.
- `app/onboarding/welcome.tsx` - New onboarding screen introducing Glenride News with finalized copy.
- `app/onboarding/notifications.tsx` - New onboarding screen handling mocked notification opt-in.
- `app/onboarding/topics.tsx` - New onboarding screen for selecting initial interests and saving to AsyncStorage.
- `app/auth/_layout.tsx` - Modal stack container for authentication screens.
- `app/auth/index.tsx` - Redirect entry for the auth stack.
- `app/auth/login.tsx` - New login/signup UI with email/password form and social placeholders.
- `app/article/[id].tsx` - Article detail view supporting save actions that trigger auth prompts.
- `app/source-manager/index.tsx` - SourceManager screen for managing custom RSS URLs.
- `utils/RssParser.js` - New utility using fast-xml-parser to normalize RSS feeds.
- `services/NewsService.js` - Main feed data service merging API mock data with parsed RSS feeds.
- `utils/Analytics.js` - Analytics helper wrapping Firebase event logging with environment guards.
- `hooks/useReducedMotion.ts` - Hook exposing reduced motion preference for animation timing.
- `hooks/useOnboardingStatus.tsx` - Provides context-backed onboarding status helpers and actions.
- `hooks/useAuth.tsx` - Auth context handling mock sign-in state and persistence.
- `utils/environment.ts` - Helper for determining whether the app is running in a mock environment.
- `constants/sources.ts` - Storage keys and limits for user-managed RSS sources.
- `package.json` - Add dependencies (fast-xml-parser, Firebase Analytics) and scripts as needed.

### Notes

- Confirm Expo compatibility for Firebase Analytics and fast-xml-parser before finalizing implementations.
- Unit tests can live alongside utilities/services using Jest (`npx jest`).
- Coordinate AsyncStorage keys across onboarding, auth, and source management to avoid collisions.

## Tasks

- [x] 1.0 Align global theming and navigation scaffolding for onboarding and auth flows
  - [x] 1.1 Update `constants/Colors.ts` with Glenride branding tokens and audit usage across theming helpers.
  - [x] 1.2 Configure Expo Router stacks: add `/onboarding`, `/auth`, and main tabs routes plus navigation guards.
  - [x] 1.3 Remove custom fonts (SpaceMono) and ensure system fonts load without blocking splash screen.
  - [x] 1.4 Implement a global context or storage check to skip onboarding after completion.
- [x] 2.0 Build onboarding experience (welcome, notifications, topic selection) with persistence
  - [x] 2.1 Build `app/onboarding/welcome.tsx` with finalized copy, CTA, and accessibility labels.
  - [x] 2.2 Build `app/onboarding/notifications.tsx` with mocked Expo Notifications prompt and skip/allow persistence.
  - [x] 2.3 Build `app/onboarding/topics.tsx` with topic grid/carousel, AsyncStorage saves, and proceed gating on ≥5 selections.
  - [x] 2.4 Wire onboarding navigation flow and transition to Main Feed after topics saved.
- [x] 3.0 Implement authentication gating and login UI with social placeholders
  - [x] 3.1 Create `app/auth/login.tsx` with email/password form, CTA label update, and mock submission handler.
  - [x] 3.2 Add social sign-in placeholders logging provider messages for Google/Apple.
  - [x] 3.3 Update ArticleDetail to check `userToken` on save and trigger login modal/banner when absent.
  - [x] 3.4 Persist mock auth state (token) and redirect back to previous screen after successful login.
- [x] 4.0 Enhance news data services with RSS parsing, feed blending, and custom sources
  - [x] 4.1 Add `fast-xml-parser` dependency and implement `utils/RssParser.js` normalizing RSS data.
  - [x] 4.2 Update `services/NewsService.js` to merge API data with RSS feeds and enforce 70/30 blend.
  - [x] 4.3 Create SourceManager screen to add/remove RSS URLs stored in AsyncStorage.
  - [x] 4.4 Connect SourceManager entry from Settings tab and ensure feed refresh picks up changes.
- [x] 5.0 Integrate analytics tracking and accessibility utilities
  - [x] 5.1 Implement `utils/Analytics.js` with Firebase Analytics integration guarded by environment checks.
  - [x] 5.2 Fire `onboarding_completed` and `article_saved` events at appropriate touchpoints.
  - [x] 5.3 Create `hooks/useReducedMotion.ts` hook and refactor affected animations/transition durations to respect it.
