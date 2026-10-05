/*
 * Sign in / Create account screen.
 * Shown by the root layout whenever nobody is signed in.
 * Uses the SAME email + password accounts as the website.
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (mode === 'signup' && !fullName.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    const message =
      mode === 'signup' ? await signUp(fullName, email, password) : await signIn(email, password);
    setSubmitting(false);
    // On success, the root layout notices the new session and shows the shop
    if (message) setError(message);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Minds Matter</Text>
          <Text style={styles.tagline}>Screen-free tools for cognitive wellness</Text>

          <View style={styles.card}>
            <Text style={styles.title}>{mode === 'signup' ? 'Create account' : 'Welcome back'}</Text>
            <Text style={styles.subtitle}>Use the same email and password as the website.</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            {mode === 'signup' && (
              <>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Jane Wanjiku"
                  placeholderTextColor={colors.muted}
                  autoComplete="name"
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="jane@example.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleSubmit}
            />

            <Pressable
              style={[styles.button, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'signup' ? 'Create account' : 'Sign in'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError(null);
              }}
            >
              <Text style={styles.switch}>
                {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { fontSize: 32, fontWeight: '700', color: colors.primary, textAlign: 'center', fontFamily: 'serif' },
  tagline: { color: colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  subtitle: { color: colors.muted, marginBottom: 16 },
  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: { color: colors.charcoal, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  switch: { color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
