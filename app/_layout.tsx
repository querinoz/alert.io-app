import React, { useEffect, useState, Component, type ErrorInfo, type ReactNode } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { Colors } from '../src/theme/colors';
import { SecurityBootScreen } from '../src/components/ui/SecurityBootScreen';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errStyles.container}>
          <Text style={errStyles.icon}>⚠️</Text>
          <Text style={errStyles.title}>Algo deu errado</Text>
          <Text style={errStyles.message}>{this.state.error?.message || 'Erro desconhecido'}</Text>
          <Pressable onPress={() => this.setState({ hasError: false, error: undefined })} style={errStyles.button}>
            <Text style={errStyles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const errStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  message: { color: '#8B949E', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#0D1117', fontWeight: '700', fontSize: 14 },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsub = initAuthListener();
    return unsub;
  }, [initAuthListener]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [booting, setBooting] = useState(true);

  if (booting) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SecurityBootScreen onComplete={() => setBooting(false)} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar style="light" />
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'fade',
              animationDuration: 280,
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="incident/report"
              options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 320 }}
            />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
                animationDuration: 250,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </Stack>
        </AuthGate>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
