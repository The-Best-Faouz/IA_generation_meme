import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './hooks/useAuth';
import { AuthNavigator } from './navigation/AuthNavigator';
import { AppNavigator } from './navigation/AppNavigator';
import { Loader } from './components/common/Loader';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { API_URL } from './constants/api';
import { COLORS } from './constants/colors';
import './i18n';

const MAX_WAKE_RETRIES = 10;
const RETRY_INTERVAL = 3000;

const waitForBackend = async (): Promise<boolean> => {
  for (let i = 0; i < MAX_WAKE_RETRIES; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, RETRY_INTERVAL));
  }
  return false;
};

const App = () => {
  const { user, loading } = useAuth();
  const [serverReady, setServerReady] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);
  const woken = useRef(false);

  const checkServer = useCallback(async () => {
    setCheckingServer(true);
    const ready = await waitForBackend();
    setServerReady(ready);
    setCheckingServer(false);
    setInitialCheckDone(true);
  }, []);

  useEffect(() => {
    if (!woken.current) {
      woken.current = true;
      checkServer();
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && initialCheckDone && !serverReady) {
        checkServer();
      }
    });
    return () => sub.remove();
  }, [checkServer, initialCheckDone, serverReady]);

  if (checkingServer) {
    return (
      <View style={styles.container}>
        <Loader message="Connexion au serveur..." />
      </View>
    );
  }

  if (!serverReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connexion impossible</Text>
        <Text style={styles.message}>
          Le serveur est inaccessible. Vérifie ta connexion internet ou réessaie.
        </Text>
        <TouchableOpacity style={styles.button} onPress={checkServer}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <Loader message="Chargement..." />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
