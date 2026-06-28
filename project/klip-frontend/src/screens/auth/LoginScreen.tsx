import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EyeIcon } from '../../components/common/EyeIcon';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { AxiosError } from 'axios';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

const getErrorMessage = (err: AxiosError<{ error: string }>): string => {
  if (!err.response) return 'Impossible de contacter le serveur. Vérifie ta connexion.';
  if (err.response.status === 401) return 'Email ou mot de passe incorrect.';
  if (err.response.status === 429) return 'Trop de tentatives. Réessaie dans 15 minutes.';
  return err.response.data?.error || 'Erreur de connexion. Réessaie.';
};

export const LoginScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email requis');
      return;
    }
    if (!password.trim()) {
      setError('Mot de passe requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <AnimatedLogo />
          <Text style={styles.slogan}>Clip it. Remix it. Send it.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="ton@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <View style={styles.passwordContainer}>
            <Input
              label="Mot de passe"
              placeholder="Ton mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <EyeIcon visible={showPassword} size={20} />
            </TouchableOpacity>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <Button title="Se connecter" onPress={handleLogin} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Pas encore de compte ?{' '}
              <Text style={styles.registerHighlight}>Creer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  slogan: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    letterSpacing: 1,
  },
  form: {
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 36,
    zIndex: 10,
    padding: 4,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  registerHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
