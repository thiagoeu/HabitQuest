import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { setupNotificationChannelAndCategories } from '../services/notificationService';
import { useAppStore } from '../store/useAppStore';

export default function RootLayout() {
  const evaluateDayChange = useAppStore((state) => state.evaluateDayChange);

  useEffect(() => {
    // Configura canais de notificacao e avalia virada de dia ao iniciar
    setupNotificationChannelAndCategories().catch(() => {});
    evaluateDayChange();
  }, [evaluateDayChange]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#12121a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0c0c12' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="habit-form"
          options={{
            presentation: 'modal',
            title: 'Configurar Meta',
            headerStyle: { backgroundColor: '#1e1e2d' },
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c12',
  },
});
