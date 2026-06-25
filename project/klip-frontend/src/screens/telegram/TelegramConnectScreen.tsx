import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useTelegram } from '../../hooks/useTelegram';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const TelegramConnectScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { connectBot, loading } = useTelegram();
  const [botToken, setBotToken] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!botToken.trim()) {
      setError('Token du bot requis');
      return;
    }
    setError('');
    try {
      await connectBot(botToken);
      navigation.navigate('TelegramFeed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Connecter Telegram</Text>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          1. Ouvre Telegram{'\n'}
          2. Cherche @BotFather{'\n'}
          3. Tape /newbot{'\n'}
          4. Donne un nom à ton bot{'\n'}
          5. Copie le token affiché
        </Text>
      </View>

      <Input
        label="Token du bot"
        placeholder="123456:ABC-DEF..."
        value={botToken}
        onChangeText={setBotToken}
        autoCapitalize="none"
      />

      {error ? <ErrorMessage message={error} /> : null}

      <Button title="Connecter" onPress={handleConnect} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
});
