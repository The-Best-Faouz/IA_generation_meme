import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRoute = RouteProp<AppStackParamList, 'FaceSwap'>;

export const FaceSwapScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenRoute>();
  const [sourceUri, setSourceUri] = useState<string | null>(route.params?.sourceUri || null);
  const [faceUri, setFaceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.sourceUri) {
      setSourceUri(route.params.sourceUri);
    }
  }, [route.params?.sourceUri]);

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
      setError(err.response?.data?.error || 'Erreur de generation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="L IA echange les visages..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Face Swap" subtitle="Echange des visages entre deux photos" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageRow}>
          <TouchableOpacity onPress={() => pickImage('source')} style={styles.halfPicker} activeOpacity={0.8}>
            {sourceUri ? (
              <Image source={{ uri: sourceUri }} style={styles.halfImage} />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="image" size={24} color={COLORS.textMuted} />
                <Text style={styles.placeholderLabel}>Source</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.swapIcon}>
            <Icon name="swap" size={20} color={COLORS.primary} />
          </View>
          <TouchableOpacity onPress={() => pickImage('face')} style={styles.halfPicker} activeOpacity={0.8}>
            {faceUri ? (
              <Image source={{ uri: faceUri }} style={styles.halfImage} />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="profile" size={24} color={COLORS.textMuted} />
                <Text style={styles.placeholderLabel}>Visage</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="Generer le Face Swap" onPress={handleGenerate} disabled={!sourceUri || !faceUri} />
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
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  halfPicker: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  halfImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  swapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
