import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { GifPreview } from '../../components/meme/GifPreview';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const GifEditorScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [gifUri, setGifUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcription, setTranscription] = useState('');

  const pickGif = () => {
    launchImageLibrary({ mediaType: 'video', quality: 0.8 }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]?.uri) {
        setGifUri(response.assets[0].uri);
        setError('');
      }
    });
  };

  const handleGenerate = async () => {
    if (!gifUri) {
      setError('Importe un GIF d\'abord');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('gif', { uri: gifUri, type: 'image/gif', name: 'animation.gif' } as any);
      formData.append('audio', { uri: gifUri, type: 'audio/m4a', name: 'instruction.m4a' } as any);

      const res = await api.post('/meme/gif', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setTranscription(res.data.transcription);
      navigation.navigate('Preview', {
        imageUrl: res.data.gifUrl,
        memeId: res.data.memeId,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="L'IA modifie ton GIF... (30-90s)" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>GIF Editor</Text>
      <Text style={styles.subtitle}>Importe un GIF et donne une instruction vocale</Text>

      <TouchableOpacity onPress={pickGif} style={styles.gifPicker}>
        {gifUri ? (
          <GifPreview uri={gifUri} width={280} height={280} />
        ) : (
          <Text style={styles.placeholder}>+ Choisir un GIF</Text>
        )}
      </TouchableOpacity>

      {transcription ? (
        <View style={styles.transcriptionBox}>
          <Text style={styles.transcriptionLabel}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}

      <Button title="Appliquer" onPress={handleGenerate} disabled={!gifUri} />
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
  gifPicker: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 16,
    overflow: 'hidden',
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  transcriptionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  transcriptionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  transcriptionText: {
    color: COLORS.text,
    fontSize: 14,
  },
});
