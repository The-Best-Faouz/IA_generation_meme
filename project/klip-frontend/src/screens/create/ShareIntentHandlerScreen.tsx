import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import { useShareIntent } from '../../hooks/useShareIntent';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const ShareIntentHandlerScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { sharedContent, isLoading, clearShare, checkForShare } = useShareIntent();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sharedContent) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [sharedContent, fadeAnim]);

  useEffect(() => {
    const interval = setInterval(() => checkForShare(), 3000);
    return () => clearInterval(interval);
  }, [checkForShare]);

  useEffect(() => {
    if (sharedContent?.imageUri) setPreviewUri(sharedContent.imageUri);
    else if (sharedContent?.videoUri) setPreviewUri(sharedContent.videoUri);
    else if (sharedContent?.uris?.length) setPreviewUri(sharedContent.uris[0]);
  }, [sharedContent]);

  const handleTextToMeme = () => { navigation.navigate('ContextReader'); clearShare(); };
  const handleImageToFaceSwap = () => { navigation.navigate('FaceSwap', { sourceUri: sharedContent?.imageUri || sharedContent?.uris?.[0] }); clearShare(); };
  const handleGifEditor = () => { navigation.navigate('GifEditor'); clearShare(); };
  const handleFaceSwap = () => { navigation.navigate('FaceSwap'); clearShare(); };

  if (isLoading) return <Loader message="Analyse du contenu partage..." />;

  if (!sharedContent) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Contenu partage" subtitle="Recu depuis une autre application" />
        <View style={styles.waitingContainer}>
          <Animated.View style={[styles.waitingContent]}>
            <View style={styles.pulseRing}>
              <View style={styles.pulseRingInner} />
            </View>
            <Text style={styles.waitingTitle}>En attente de contenu...</Text>
            <Text style={styles.waitingSubtitle}>
              Ouvre WhatsApp, Telegram, Instagram ou ton navigateur.
            </Text>
            <View style={styles.shareHintBox}>
              <View style={styles.shareStep}>
                <Icon name="chat" size={16} color={COLORS.primary} />
                <Text style={styles.shareStepText}>
                  1. Selectionne un message, une photo ou un sticker
                </Text>
              </View>
              <View style={styles.shareStep}>
                <Icon name="import" size={16} color={COLORS.primary} />
                <Text style={styles.shareStepText}>
                  2. Appuie sur Partager et choisis KLIP
                </Text>
              </View>
              <View style={styles.shareStep}>
                <Icon name="sparkle" size={16} color={COLORS.warning} />
                <Text style={styles.shareStepText}>
                  3. KLIP transforme ton contenu en meme !
                </Text>
              </View>
            </View>
            <Text style={styles.waitingHint}>
              Le contenu partage apparait automatiquement ici...
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  const typeLabel = sharedContent.type === 'text' ? 'Texte' :
    sharedContent.type === 'image' ? 'Image / Sticker' :
    sharedContent.type === 'video' ? 'GIF / Video' : 'Fichiers multiples';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Contenu recu" subtitle={typeLabel} />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sourceBadge}>
            <Icon name="chat" size={14} color={COLORS.primary} />
            <Text style={styles.sourceText}>WhatsApp / Telegram</Text>
          </View>

          {sharedContent.type === 'text' && sharedContent.text && (
            <View style={styles.textPreview}>
              <View style={styles.textPreviewHeader}>
                <Icon name="chat" size={16} color={COLORS.primary} />
                <Text style={styles.textPreviewLabel}>Message recu</Text>
              </View>
              <Text style={styles.textPreviewContent}>{sharedContent.text}</Text>
              <View style={styles.charCount}>
                <Text style={styles.charCountText}>{sharedContent.text.length} caracteres</Text>
              </View>
            </View>
          )}

          {previewUri && (
            <View style={styles.imagePreviewSection}>
              <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />
              {sharedContent.uris && sharedContent.uris.length > 1 && (
                <Text style={styles.multiCount}>+{sharedContent.uris.length - 1} fichier(s)</Text>
              )}
            </View>
          )}

          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>Transformer en :</Text>

            {sharedContent.type === 'text' && (
              <>
                <Button title="Meme humouristique" onPress={handleTextToMeme} />
                <Button title="Remixer avec une image" onPress={() => { navigation.navigate('StatusRemixer'); clearShare(); }} variant="secondary" />
              </>
            )}

            {(sharedContent.type === 'image' || sharedContent.type === 'multiple') && (
              <>
                <Button title="Face Swap sur cette image" onPress={handleImageToFaceSwap} />
                <Button title="Ajouter du texte IA" onPress={() => { navigation.navigate('StatusRemixer'); clearShare(); }} variant="secondary" />
                <Button title="Face Swap avec un visage" onPress={handleFaceSwap} variant="outline" />
              </>
            )}

            {sharedContent.type === 'video' && (
              <>
                <Button title="Editer ce GIF par la voix" onPress={handleGifEditor} />
                <Button title="Ajouter du texte" onPress={() => { navigation.navigate('StatusRemixer'); clearShare(); }} variant="outline" />
              </>
            )}

            <Button title="Ignorer" onPress={clearShare} variant="outline" />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 60 },
  waitingContent: { alignItems: 'center' },
  pulseRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  pulseRingInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  waitingTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  waitingSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shareHintBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, width: '100%', gap: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  shareStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shareStepText: { color: COLORS.text, fontSize: 13, flex: 1 },
  waitingHint: { color: COLORS.surfaceLight, fontSize: 12, fontStyle: 'italic' },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  sourceText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  textPreview: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  textPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  textPreviewLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  textPreviewContent: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  charCount: { marginTop: 8, alignItems: 'flex-end' },
  charCountText: { color: COLORS.surfaceLight, fontSize: 11 },
  imagePreviewSection: { marginBottom: 20 },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: COLORS.surface },
  multiCount: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },
  actions: { gap: 12 },
  actionsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
});
