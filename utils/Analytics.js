import Constants from 'expo-constants';

let AnalyticsModule = null;

const isProduction = process.env.NODE_ENV === 'production';
const explicitEnable = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true';
const analyticsConfig = Constants?.expoConfig?.extra?.analytics ?? {};

export const isAnalyticsEnabled =
  analyticsConfig.enabled ?? explicitEnable ?? isProduction;
export const measurementId = analyticsConfig.measurementId;

async function getAnalyticsModule() {
  if (AnalyticsModule) return AnalyticsModule;
  try {
    AnalyticsModule = await import('expo-firebase-analytics');
    return AnalyticsModule;
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Analytics module not available', error);
    }
    return null;
  }
}

export async function trackEvent(name, params = {}) {
  if (!isAnalyticsEnabled) {
    if (__DEV__) {
      console.log(`[analytics:disabled] ${name}`, params);
    }
    return;
  }

  try {
    const analytics = await getAnalyticsModule();
    if (!analytics || typeof analytics.logEvent !== 'function') {
      if (__DEV__) {
        console.warn('Analytics logEvent unavailable');
      }
      return;
    }
    if (measurementId && analytics.setDefaultEventParameters) {
      analytics.setDefaultEventParameters({ measurement_id: measurementId });
    }
    await analytics.logEvent(name, params);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to log analytics event', name, error);
    }
  }
}
