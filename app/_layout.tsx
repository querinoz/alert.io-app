import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { Colors } from '../src/theme/colors';
import { LiveDemoRunner } from '../src/components/ui/LiveDemoRunner';
import { SecurityBootScreen } from '../src/components/ui/SecurityBootScreen';

function useAutoLogin() {
  const ran = useRef(false);
  const { signInDemo, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (ran.current || isAuthenticated) return;
    ran.current = true;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autologin') === '1') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    signInDemo();
  }, [isAuthenticated]);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, initAuthListener } = useAuthStore();

  useAutoLogin();

  useEffect(() => {
    const unsub = initAuthListener();
    return unsub;
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      // auto-login will handle it — no redirect to sign-in
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

function useDemoMode() {
  const [enabled, setEnabled] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        setEnabled(true);
        if (params.get('autostart') === '1') setAutoStart(true);
      }
    }
  }, []);
  return { enabled, autoStart };
}

export default function RootLayout() {
  const [booting, setBooting] = useState(true);
  const { enabled: showDemo, autoStart } = useDemoMode();
  const routerRef = useRef<ReturnType<typeof useRouter> | null>(null);

  const handleNavigate = useCallback((screen: string) => {
    const r = routerRef.current;
    if (!r) return;
    try {
      switch (screen) {
        case 'sign-up': r.push('/(auth)/sign-up'); break;
        case 'sign-in': r.push('/(auth)/sign-in'); break;
        case 'tabs': r.replace('/(tabs)'); break;
        case 'family': r.push('/(tabs)/family'); break;
        case 'chain': r.push('/(tabs)/chain'); break;
        case 'profile': r.push('/(tabs)/profile'); break;
        case 'report': r.push('/incident/report'); break;
        case 'settings': r.push('/settings'); break;
        case 'accessibility': r.push('/settings/accessibility'); break;
        default: break;
      }
    } catch {}
  }, []);

  if (booting) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SecurityBootScreen onComplete={() => setBooting(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {showDemo && <LiveDemoRunner onNavigate={handleNavigate} autoStart={autoStart} />}
      <AuthGate>
        <RouterRefCapture routerRef={routerRef} />
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
  );
}

function RouterRefCapture({ routerRef }: { routerRef: React.MutableRefObject<any> }) {
  const router = useRouter();
  useEffect(() => { routerRef.current = router; }, [router]);
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
