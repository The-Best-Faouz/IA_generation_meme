import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { GifPreview } from '../../components/meme/GifPreview';
import { Icon } from '../../components/common/Icon';
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
      setError('Importe un GIF d abord');
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
      setError(err.response?.data?.error || 'Erreur de generation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="L IA modifie ton GIF..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="GIF Editor" subtitle="Edite un GIF avec une commande vocale" />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={pickGif} style={styles.gifPicker} activeOpacity={0.8}>
          {gifUri ? (
            <GifPreview uri={gifUri} width={280} height={280} />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderIcon}>
                <Icon name="gif" size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.placeholderText}>Choisir un GIF</Text>
            </View>
          )}
        </TouchableOpacity>

        {transcription ? (
          <View style={styles.transcriptionBox}>
            <View style={styles.transcriptionHeader}>
              <Icon name="mic" size={16} color={COLORS.primary} />
              <Text style={styles.transcriptionLabel}>Transcription</Text>
            </View>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        ) : null}

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="Appliquer la modification" onPress={handleGenerate} disabled={!gifUri} />
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
    alignItems: 'center',
    gap: 8,
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  transcriptionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  transcriptionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transcriptionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
