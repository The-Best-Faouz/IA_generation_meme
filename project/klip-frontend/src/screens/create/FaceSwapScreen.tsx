import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const FaceSwapScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [faceUri, setFaceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = (type: 'source' | 'face') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.9 }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]?.uri) {
        if (type === 'source') setSourceUri(response.assets[0].uri);
        else setFaceUri(response.assets[0].uri);
        setError('');
      }
    });
  };

  const handleGenerate = async () => {
    if (!sourceUri || !faceUri) {
      setError('Deux images requises');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('source', { uri: sourceUri, type: 'image/jpeg', name: 'source.jpg' } as any);
      formData.append('face', { uri: faceUri, type: 'image/jpeg', name: 'face.jpg' } as any);

      const res = await api.post('/meme/faceswap', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        memeId: res.data.memeId,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="L'IA swappe les visages... (peut prendre 30-60s)" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Face Swap</Text>
      <Text style={styles.subtitle}>Colle un visage sur une image</Text>

      <TouchableOpacity onPress={() => pickImage('source')} style={styles.imagePicker}>
        {sourceUri ? (
          <Image source={{ uri: sourceUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>+ Image source (le corps)</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickImage('face')} style={styles.imagePicker}>
        {faceUri ? (
          <Image source={{ uri: faceUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>+ Visage à coller</Text>
        )}
      </TouchableOpacity>

      {error ? <ErrorMessage message={error} /> : null}

      <Button title="Générer le Face Swap" onPress={handleGenerate} disabled={!sourceUri || !faceUri} />
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
  imagePicker: {
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
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
});
