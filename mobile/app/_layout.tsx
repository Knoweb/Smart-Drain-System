import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '../lib/supabase';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { expoPushToken } = usePushNotifications();
  const segments = useSegments();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const [loaded, error] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if ((loaded || error) && isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!session && inAuthGroup) {
      // Redirect unauthenticated users to the login screen
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      // Redirect authenticated users away from login
      router.replace('/(tabs)');
    }
  }, [session, isReady, segments]);

  if (!isReady || (!loaded && !error)) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
