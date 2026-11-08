# PRD: Onboarding and Authentication Foundations

## Introduction / Overview
Glenride News is a curated, global news aggregator targeting users who prefer a single destination for diverse topics. This release delivers the foundation for onboarding, personalization, and authentication so that first-time users can understand the value proposition, select interests, and create an account when they try to save articles. It also sets up supporting infrastructure for blending RSS sources with mocked API data and managing custom feeds.

## Goals
- Help new users grasp Glenride News' value within the first session and configure their preferred topics.
- Ensure onboarding complies with WCAG 2.1 AA accessibility standards and aligns with brand colors (PRIMARY_ACCENT `#E97451`, BACKGROUND_LIGHT `#F2F2F7`).
- Provide a frictionless path from anonymous exploration to account creation, prompting authentication on the first persistent action (saving an article).
- Establish extensible data fetching that combines mocked API responses with RSS feeds to produce a cohesive main feed.
- Allow users to manage custom RSS sources for future personalization without requiring backend support yet.

## User Stories
- As a new user, I want to read a concise welcome message so I understand why Glenride News exists before investing time.
- As a new user, I want to be asked about notifications in context so I can opt in to timely updates later.
- As a new user, I want to choose at least five interests from a global set so the initial feed reflects what I care about.
- As an exploring user, I want to view articles immediately without creating an account so I can evaluate the app.
- As a user attempting to save an article, I want to be prompted to sign in so that my preferences persist across sessions.
- As a potential subscriber, I want to see social sign-in options so I believe the app supports modern authentication flows.
- As a user who follows niche sources, I want to add custom RSS URLs so my feed can include content beyond the defaults.
- As an administrator/PM, I want consistent article objects from all sources so future features (sorting, filtering) can rely on one shape.

## Functional Requirements
1. Welcome Screen
   1.1 Display Glenride News branding, the final slogan "Glenride News: Curated Clarity. Your world, sorted.", and a call-to-action to continue.
   1.2 Provide accessible labels and ensure text/background color contrast satisfies WCAG 2.1 AA.
   1.3 Track whether the welcome screen has been viewed (AsyncStorage) to avoid replaying on subsequent launches.
2. Notification Opt-In Screen
   2.1 Present immediately after the welcome screen with clear rationale for notifications.
   2.2 Include a mocked permission request using Expo Notifications (e.g., `if (mockEnv) return true;`).
   2.3 Support skip and enable actions; reflect the result in a stored preference for future reference.
3. Topic Selection Screen
   3.1 Offer a responsive carousel or grid of global topics (minimum list: Tech, Politics, Sports, Windsurf, Business, Health, Culture) with supporting subtext "Customize Your Feed. Select 5+ to start your journey."
   3.2 Require users to select at least five interests before proceeding.
   3.3 Use PRIMARY_ACCENT styling for selected states; persist `initialInterests` to AsyncStorage.
   3.4 Provide accessibility labels and ensure touch targets meet 44×44dp guidance.
4. Transition to Main Feed
   4.1 After successful topic selection, automatically navigate to the Main Feed screen via Expo Router.
   4.2 Pass the selected topics so the feed can be filtered immediately.
5. Authentication Prompt Flow
   5.1 Allow anonymous browsing of the main feed and article detail screens.
   5.2 On ArticleDetail, intercept the `Save Article` action; if `userToken` is missing, present a modal or banner prompting login/sign-up with the message "Please log in or sign up to save articles."
   5.3 Navigate the user to the Login screen when they choose to authenticate.
6. Login & Sign-Up Screens
   6.1 Implement email/password authentication UI (inputs, password visibility toggle, primary CTA labeled "Unlock Your Saved Reads" and styled with PRIMARY_ACCENT) without backend submission for now (mock success response).
   6.2 Include placeholder buttons for Google and Apple sign-in; tapping logs "Mock social login initiated with provider X".
   6.3 Provide accessible form labels, error messaging placeholders, and outline validation rules (e.g., basic email format, min password length) for future implementation.
   6.4 Ensure the onboarding sequence completes before these screens are shown unless triggered by the save flow.
7. Navigation Structure
   7.1 Use Expo Router nested layouts so onboarding steps reside under an `/onboarding` stack, authentication under `/auth`, and the main experience under `/`.
   7.2 Support responsive layouts (portrait/landscape, tablet) using Flexbox and percentage-based sizing.
8. RSS Parsing Utility
   8.1 Create `utils/RssParser.js` exporting async `parseRssFeed(url)` that fetches and parses RSS feeds using the `fast-xml-parser` library.
   8.2 Normalize output to `{ title, content, source, publishDate, url }` with sensible fallbacks when fields are missing.
   8.3 Handle and log parsing errors without crashing the app; return empty arrays when feeds fail.
   8.4 Document within the utility that heavy parsing should migrate to a serverless backend in future iterations.
9. News Service Integration
   9.1 Update `NewsService.js` to accept `topic` and `rssUrls` parameters in `fetchMainFeed()`.
   9.2 Call `parseRssFeed(url)` for each URL (minimum three hard-coded MVP feeds) and merge results with existing mocked API data.
   9.3 Sort the combined array by `publishDate` descending before returning.
   9.4 Provide mock topic-to-feed mappings so topic selection can tailor the feed.
   9.5 Produce a blended feed with a 70/30 split (70% topic-matched/custom-source articles, 30% "Top Stories" from the general feed) to balance personalization and discovery.
10. Source Manager Feature
   10.1 Add a SourceManager screen accessible via Settings → "Manage Custom Sources" using the standard list item component.
   10.2 Display RSS URLs stored in AsyncStorage with options to remove entries (delete icon using PRIMARY_ACCENT).
   10.3 Include an "Add New Source" button styled with PRIMARY_ACCENT; tapping opens a modal titled "Add a Custom Glenride Source" with a text input.
   10.4 Saving from the modal appends the URL to AsyncStorage and updates the list (no validation required).
   10.5 Ensure list items and controls meet accessibility label and hit-area requirements.
11. Analytics & Instrumentation
   11.1 Update `utils/Analytics.js` so `trackEvent` checks production mode before logging.
   11.2 Integrate Firebase Analytics (via Expo) to record `onboarding_completed` and `article_saved` events when triggered.
   11.3 Provide safe no-op fallbacks for development environments to avoid crashes when Firebase is not configured.
12. Motion Preferences
   12.1 Create a `useReducedMotion()` hook (e.g., leveraging React Native accessibility utilities) that returns whether reduced motion is requested.
   12.2 Ensure new animations (onboarding transitions, modals) reference the hook (e.g., `const animationDuration = isReducedMotion ? 0 : 300;`) so later enhancements can respect the preference.
13. Copy & Feedback
   13.1 Use the following strings throughout the experience: save confirmation toast "Article saved to your Glenride Reads." and consistent CTA labels noted above.
   13.2 Employ a placeholder icon that evokes authority/clarity (e.g., system "newspaper" icon) until the final Glenride logo asset is delivered.
   13.3 Rely on system default fonts (San Francisco on iOS, Roboto on Android) and avoid bundling custom fonts in the MVP.

## Non-Goals (Out of Scope)
- Implementing real backend authentication or social login flows.
- Delivering production push notifications or background refresh behavior.
- Advanced topic recommendation algorithms beyond initial selection.
- Comprehensive RSS validation, deduplication, or full-text scraping.
- Localization/internationalization support beyond English placeholder copy.

## Design Considerations
- Update global color tokens to match PRIMARY_ACCENT and BACKGROUND_* values; ensure dark theme uses deep charcoal background with light text.
- Maintain consistent typography and spacing across onboarding screens for a calm reading experience.
- Provide smooth transitions between onboarding steps (e.g., fade/slide animations) without causing motion sickness (offer reduced motion respect if possible).
- Use iconography and illustrations that are non-regional and inclusive.
- Replace placeholder copy with the finalized slogans/CTAs defined in Functional Requirements section and plan for quick swap once bespoke assets are created.

## Technical Considerations
- Leverage AsyncStorage for onboarding completion flags, notification preference, topic selections, custom sources, and cached user token.
- Structure code within Expo Router conventions (`app/onboarding/...`, `app/auth/...`, `app/(tabs)/...`).
- Introduce a configuration flag or environment helper (`mockEnv`) to control mocked behaviors (notifications, auth responses).
- Use `fast-xml-parser` for on-device RSS parsing while noting the roadmap to move parsing to a backend/serverless layer when scaling.
- Ensure accessibility support by using `accessibilityLabel`, `accessible`, `onAccessibilityTap`, and dynamic font scaling.
- Plan for unit tests around parsing utilities, service aggregation, analytics logging, and reduced motion behavior (even if deferred in implementation steps).
- Integrate Firebase Analytics via Expo modules and guard usage behind environment checks to prevent development-time issues.
- Scaffold the `useReducedMotion()` hook so future animation work can query the user’s preference without refactors.

## Success Metrics
- ≥80% of new users complete onboarding (welcome → topic selection) without abandoning during usability tests.
- ≥90% of tappable elements pass accessibility audits (contrast, hit target, labels).
- Time to first personalized article (from app install to main feed with selected topics) < 2 minutes in usability sessions.
- Mocked social login buttons demonstrate intended flow in stakeholder demos without runtime errors.
- SourceManager successfully persists added/removed RSS URLs across app restarts (manual QA acceptance).
- Analytics events `onboarding_completed` and `article_saved` register successfully in Firebase during internal testing.

## Open Questions
- What is the target timeline for migrating RSS parsing off-device to a serverless/backend service?
- When will final logo/illustration assets be available to replace the placeholder iconography?
- Do we need to capture additional analytics events (e.g., notification opt-in decisions) for the onboarding dashboard?
- Should the 70/30 blend ratio be configurable via remote settings for experimentation in later releases?
