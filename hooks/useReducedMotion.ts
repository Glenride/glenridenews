import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const updateState = (value: boolean) => {
      if (isMounted) {
        setIsReducedMotionEnabled(Boolean(value));
      }
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then(updateState)
      .catch(() => updateState(false));

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      updateState,
    );

    return () => {
      isMounted = false;
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else {
        // Fallback for older React Native versions
        // @ts-ignore - supported on legacy APIs
        AccessibilityInfo.removeEventListener?.('reduceMotionChanged', updateState);
      }
    };
  }, []);

  return isReducedMotionEnabled;
}
