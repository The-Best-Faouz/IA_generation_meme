import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { COLORS } from '../../constants/colors';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const COUNTRIES = [
  { code: 'CM', name: 'Cameroun' },
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'États-Unis' },
  { code: 'NG', name: 'Nigeria' },
];

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'Anglais' },
];

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country, setCountry] = useState('CM');
  const [language, setLanguage] = useState('fr');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(email, password, country, language);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KLIP</Text>
        <Text style={styles.slogan}>Crée ton compte</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="ton@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <Input
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Pays</Text>
        <View style={styles.chipRow}>
          {COUNTRIES.map((c) => (
            <Button
              key={c.code}
              title={c.name}
              variant={country === c.code ? 'primary' : 'outline'}
              onPress={() => setCountry(c.code)}
              style={styles.chip}
            />
          ))}
        </View>

        <Text style={styles.label}>Langue</Text>
        <View style={styles.chipRow}>
          {LANGUAGES.map((l) => (
            <Button
              key={l.code}
              title={l.name}
              variant={language === l.code ? 'primary' : 'outline'}
              onPress={() => setLanguage(l.code)}
              style={styles.chip}
            />
          ))}
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="S'inscrire" onPress={handleRegister} loading={loading} />
        <Button title="Déjà un compte ?" variant="outline" onPress={() => navigation.navigate('Login')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  slogan: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  form: {
    gap: 12,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 28,
    zIndex: 1,
    padding: 6,
  },
  eyeIcon: {
    fontSize: 20,
  },
});
