import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
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
type ScreenRoute = RouteProp<AppStackParamList, 'StickerStudio'>;

export const StickerStudioScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenRoute>();

  const [sourceUri, setSourceUri] = useState<string | null>(route.params?.imageUri || null);
  const [faceUri, setFaceUri] = useState<string | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'faceswap' | 'addtext'>('faceswap');
  const [textOverlay, setTextOverlay] = useState('');

  useEffect(() => {
    if (route.params?.imageUri) setSourceUri(route.params.imageUri);
  }, [route.params?.imageUri]);

  const pickImage = (type: 'source' | 'face') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.9 }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]?.uri) {
        if (type === 'source') setSourceUri(response.assets[0].uri);
        else setFaceUri(response.assets[0].uri);
        setResultUri(null);
        setError('');
      }
    });
  };

  const handleFaceSwap = async () => {
    if (!sourceUri || !faceUri) {
      setError('Sticker et visage requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/sticker/faceswap', {
        stickerUri: sourceUri,
        faceUri: faceUri,
      });
      setResultUri(res.data.imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur face swap');
    } finally {
      setLoading(false);
    }
  };

  const handleAddText = async () => {
    if (!sourceUri || !textOverlay.trim()) {
      setError('Sticker et texte requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/sticker/add-text', {
        imageUri: sourceUri,
        text: textOverlay.trim(),
      });
      setResultUri(res.data.imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur ajout texte');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Traitement du sticker..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Sticker Studio" subtitle="Transforme un sticker en creation unique" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'faceswap' && styles.modeBtnActive]}
            onPress={() => setMode('faceswap')}>
            <Icon name="swap" size={16} color={mode === 'faceswap' ? COLORS.white : COLORS.textMuted} />
            <Text style={[styles.modeBtnText, mode === 'faceswap' && styles.modeBtnTextActive]}>Face Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'addtext' && styles.modeBtnActive]}
            onPress={() => setMode('addtext')}>
            <Icon name="edit" size={16} color={mode === 'addtext' ? COLORS.white : COLORS.textMuted} />
            <Text style={[styles.modeBtnText, mode === 'addtext' && styles.modeBtnTextActive]}>Ajouter texte</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => pickImage('source')} style={styles.imagePicker} activeOpacity={0.8}>
          {sourceUri ? (
            <Image source={{ uri: sourceUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="sticker" size={32} color={COLORS.textMuted} />
              <Text style={styles.placeholderText}>Sticker source</Text>
            </View>
          )}
        </TouchableOpacity>

        {mode === 'faceswap' && (
          <TouchableOpacity onPress={() => pickImage('face')} style={styles.imagePicker} activeOpacity={0.8}>
            {faceUri ? (
              <Image source={{ uri: faceUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Icon name="profile" size={32} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>Visage a coller</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {resultUri && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Resultat</Text>
            <Image source={{ uri: resultUri }} style={styles.resultImage} />
          </View>
        )}

        {error ? <ErrorMessage message={error} /> : null}

        {mode === 'addtext' && (
          <View style={styles.textInputSection}>
            <TextInput
              style={styles.textInput}
              placeholder="Texte a ajouter sur le sticker..."
              placeholderTextColor={COLORS.textMuted}
              value={textOverlay}
              onChangeText={setTextOverlay}
              multiline
              maxLength={200}
            />
            <Button title="Ajouter le texte" onPress={handleAddText} disabled={!sourceUri || !textOverlay.trim()} />
          </View>
        )}

        {mode === 'faceswap' && (
          <Button title="Echanger le visage" onPress={handleFaceSwap} disabled={!sourceUri || !faceUri} />
        )}
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  modeBtnTextActive: {
    color: COLORS.white,
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
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  resultBox: {
    marginBottom: 16,
  },
  resultLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  textInputSection: {
    marginBottom: 16,
    gap: 12,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
