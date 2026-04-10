import { Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="sign-in" options={{ animation: 'fade', animationDuration: 350 }} />
      <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
    </Stack>
  );
}
