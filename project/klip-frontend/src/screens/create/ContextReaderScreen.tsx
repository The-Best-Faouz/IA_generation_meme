import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
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
      setError(err.response?.data?.error || 'Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="L'IA génère ton mème..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Context Reader</Text>
      <Text style={styles.subtitle}>Colle un extrait de conversation</Text>

      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={8}
        placeholder="Colle ici ton texte WhatsApp/Telegram..."
        placeholderTextColor={COLORS.textMuted}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      {error ? <ErrorMessage message={error} /> : null}

      <Button title="Générer le mème" onPress={handleGenerate} />
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
});
