import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const ContextReaderScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Colle un texte de conversation');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/meme/text', { text });
      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        memeId: res.data.memeId,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de generation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="L IA genere ton meme..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Context Reader" subtitle="Transforme un texte en meme" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Icon name="chat" size={18} color={COLORS.primary} />
            <Text style={styles.inputLabel}>Texte de la conversation</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={8}
            placeholder="Colle ici ton texte WhatsApp ou Telegram..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="Generer le meme" onPress={handleGenerate} />
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
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textArea: {
    color: COLORS.text,
    fontSize: 15,
    minHeight: 160,
    lineHeight: 22,
  },
});
