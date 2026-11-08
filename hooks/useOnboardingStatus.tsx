import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { trackEvent } from '@/utils/Analytics';

type OnboardingContextValue = {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  markOnboardingComplete: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

const STORAGE_KEY = '@glenride/onboardingComplete';
const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedValue === 'true' && isMounted) {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.warn('Failed to load onboarding status', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const markOnboardingComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setIsOnboardingComplete(true);
      await trackEvent('onboarding_completed');
    } catch (error) {
      console.warn('Failed to persist onboarding status', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.warn('Failed to reset onboarding status', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      isOnboardingComplete,
      isLoading,
      markOnboardingComplete,
      resetOnboarding,
    }),
    [isOnboardingComplete, isLoading, markOnboardingComplete, resetOnboarding],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingStatus() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboardingStatus must be used within an OnboardingProvider');
  }

  return context;
}
