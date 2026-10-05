/*
 * ROOT LAYOUT — wraps every screen.
 * - While we check for a saved session: show a spinner.
 * - Nobody signed in: show the Login screen.
 * - Signed in: show two tabs, "Shop" (index.tsx) and "Cart" (cart.tsx),
 *   with a Logout button in the header.
 */
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import { colors } from '../lib/theme';
import LoginScreen from '../components/LoginScreen';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) return <LoginScreen />;

  function confirmLogout() {
    Alert.alert('Log out', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTitleStyle: { color: colors.primary, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.cream },
        headerRight: () => (
          <Pressable onPress={confirmLogout} style={{ marginRight: 16 }}>
            <Text style={{ color: colors.secondary, fontWeight: '700' }}>Logout</Text>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
    </Tabs>
  );
}
