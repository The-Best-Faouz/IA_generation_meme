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
import { CountryPicker } from '../../components/common/CountryPicker';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';
import { AxiosError } from 'axios';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

const getErrorMessage = (err: AxiosError<{ error: string }>): string => {
  if (!err.response) return 'Impossible de contacter le serveur. Vérifie ta connexion.';
  if (err.response.status === 409) return 'Cet email est déjà utilisé.';
  if (err.response.status === 429) return 'Trop de tentatives. Réessaie dans 15 minutes.';
  return err.response.data?.error || 'Erreur d\'inscription. Réessaie.';
};

export const RegisterScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; language: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email.trim()) {
      setError('Email requis');
      return;
    }
    if (!password.trim()) {
      setError('Mot de passe requis');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Minimum 6 caractères');
      return;
    }
    if (!selectedCountry) {
      setError('Sélectionne un pays');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(email.trim(), password, selectedCountry.code, selectedCountry.language);
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
              placeholder="Minimum 6 caractères"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <EyeIcon visible={showPassword} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <Input
              label="Confirmer le mot de passe"
              placeholder="Retape ton mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoComplete="new-password"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
              <EyeIcon visible={showConfirm} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.countrySection}>
            <Text style={styles.countryLabel}>Pays</Text>
            <CountryPicker
              value={selectedCountry?.code || 'FR'}
              onChange={(country) => setSelectedCountry(country)}
            />
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <Button title="Creer mon compte" onPress={handleRegister} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Deja un compte ?{' '}
              <Text style={styles.loginHighlight}>Se connecter</Text>
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
    marginTop: 40,
    marginBottom: 32,
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
  countrySection: {
    marginBottom: 16,
  },
  countryLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  loginHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
