import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

const PASSWORD_MIN_LENGTH = 8;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { signInMock } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    if (!params.redirect || Array.isArray(params.redirect)) return undefined;
    return params.redirect;
  }, [params.redirect]);

  const validateInputs = useCallback(() => {
    if (!email.trim()) {
      return 'Please enter your email address.';
    }

    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(email.trim())) {
      return 'Enter a valid email address (e.g., name@example.com).';
    }

    if (!password) {
      return 'Please enter your password.';
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }

    return null;
  }, [email, password]);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    // Mock API call placeholder for MVP.
    setTimeout(async () => {
      try {
        await signInMock();
        console.log('Mock email/password login success for', email);
        router.replace(redirectPath ?? '/(tabs)');
      } finally {
        setIsSubmitting(false);
      }
    }, 600);
  }, [email, isSubmitting, redirectPath, router, signInMock, validateInputs]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleSocialPress = useCallback((provider: 'Google' | 'Apple') => {
    console.log(`Mock social login initiated with provider ${provider}`);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Unlock Your Saved Reads</Text>
        </View>

        <RNView style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            accessibilityLabel="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor={palette.tabIconDefault}
            style={[styles.input, { borderColor: palette.tint, color: palette.text }]}
            value={email}
          />

          <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
          <View style={[styles.passwordRow, { borderColor: palette.tint }]}
            accessibilityLabel="Password"
            accessibilityRole="adjustable"
          >
            <TextInput
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              placeholderTextColor={palette.tabIconDefault}
              style={[styles.passwordInput, { color: palette.text }]}
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              onPress={togglePasswordVisibility}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.toggleText, { color: palette.tint }]}>
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
          ) : (
            <Text style={styles.helperText}>
              Use a valid email and a password with at least {PASSWORD_MIN_LENGTH} characters.
            </Text>
          )}
        </RNView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit login form"
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: palette.tint,
              opacity: isSubmitting ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: palette.background }]}>Unlock Your Saved Reads</Text>
        </Pressable>

        <RNView style={styles.socialContainer}>
          <Text style={styles.socialHeading}>Or continue with</Text>
          <RNView style={styles.socialRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              onPress={() => handleSocialPress('Google')}
              style={({ pressed }) => [
                styles.socialButton,
                {
                  borderColor: palette.tabIconDefault,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={[styles.socialLabel, { color: palette.text }]}>Google</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              onPress={() => handleSocialPress('Apple')}
              style={({ pressed }) => [
                styles.socialButton,
                {
                  borderColor: palette.tabIconDefault,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={[styles.socialLabel, { color: palette.text }]}>Apple</Text>
            </Pressable>
          </RNView>
        </RNView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  passwordLabel: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ff453a',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    gap: 12,
  },
  socialHeading: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'center',
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
