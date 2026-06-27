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

export const PromptScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Decris le meme que tu veux');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/meme/prompt', { prompt });
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

  if (loading) return <Loader message="L IA dessine ton meme..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Prompt libre" subtitle="Decris le meme de tes reves" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Icon name="sparkle" size={18} color={COLORS.warning} />
            <Text style={styles.inputLabel}>Description</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="Ex: un chat qui code a 3h du matin en pyjama..."
            placeholderTextColor={COLORS.textMuted}
            value={prompt}
            onChangeText={setPrompt}
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
    minHeight: 140,
    lineHeight: 22,
  },
});
