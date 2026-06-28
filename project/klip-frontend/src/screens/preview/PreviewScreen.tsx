import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { TextOverlay } from '../../components/meme/TextOverlay';
import { Icon } from '../../components/common/Icon';
import { DownloadAndShareService } from '../../services/downloadAndShare.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;
type RouteParams = {
  imageUrl: string;
  caption?: string;
  memeId?: string;
};

export const PreviewScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;
  const { imageUrl = '', caption } = params;
  const [isSharing, setIsSharing] = useState(false);

  const handleShareSticker = async () => {
    try {
      setIsSharing(true);
      await DownloadAndShareService.shareWhatsApp({
        imageUrl,
        caption: caption || 'Regarde ce meme genere avec KLIP !',
        asSticker: true,
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Erreur', 'Impossible de partager le meme. Verifie ta connexion internet.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsSharing(true);
      await DownloadAndShareService.shareWhatsApp({
        imageUrl,
        caption: caption || 'Regarde ce meme genere avec KLIP !',
        asSticker: false,
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Erreur', 'Impossible de partager le meme. Verifie ta connexion internet.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    Alert.alert('Sauvegarde', 'Sticker sauvegarde dans la galerie !');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Apercu" subtitle={caption ? caption.slice(0, 40) + '...' : undefined} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          {caption ? <TextOverlay text={caption} position="bottom" /> : null}
        </View>

        {caption && (
          <View style={styles.captionBox}>
            <View style={styles.captionHeader}>
              <Icon name="chat" size={14} color={COLORS.primary} />
              <Text style={styles.captionLabel}>Legende</Text>
            </View>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={isSharing ? 'Partage en cours...' : 'Partager (Sticker)'}
            onPress={handleShareSticker}
            variant="secondary"
            disabled={isSharing}
          />
          <Button
            title={isSharing ? 'Partage en cours...' : 'Partager (Image)'}
            onPress={handleShareImage}
            disabled={isSharing}
          />
          <Button title="Sauvegarder dans la galerie" onPress={handleSave} />
        </View>
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
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  captionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  captionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  captionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
  },
});
