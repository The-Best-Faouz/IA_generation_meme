import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Icon } from '../../components/common/Icon';
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
    <View style={styles.container}>
      <ScreenHeader title="Connecter Telegram" subtitle="Lie ton bot Telegram a KLIP" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.instructions}>
          <View style={styles.instructionsHeader}>
            <Icon name="telegram" size={18} color="#3b82f6" />
            <Text style={styles.instructionsTitle}>Configuration</Text>
          </View>
          <Text style={styles.instructionText}>
            1. Ouvre Telegram et cherche @BotFather{'\n'}
            2. Envoie /newbot{'\n'}
            3. Donne un nom a ton bot{'\n'}
            4. Copie le token HTTP fourni
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

        <Button title="Connecter le bot" onPress={handleConnect} loading={loading} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  instructionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
