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

import { AUTH_STORAGE_KEYS, AuthToken } from '@/constants/auth';

type AuthContextValue = {
  userToken: AuthToken | null;
  isLoading: boolean;
  signInMock: (token?: AuthToken) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        if (storedToken && isMounted) {
          setUserToken(storedToken);
        }
      } catch (error) {
        console.warn('Failed to load auth token', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const signInMock = useCallback(async (token: AuthToken = 'mock-token') => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      setUserToken(token);
    } catch (error) {
      console.warn('Failed to persist auth token', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      setUserToken(null);
    } catch (error) {
      console.warn('Failed to clear auth token', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      userToken,
      isLoading,
      signInMock,
      signOut,
    }),
    [userToken, isLoading, signInMock, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
