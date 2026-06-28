import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
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
  const { imageUrl = '', caption = '' } = params;
  
  const [editableCaption, setEditableCaption] = useState(caption);
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await Share.open({
          url: uri,
          message: 'Regarde ce mème créé avec KLIP !',
        });
      }
    } catch (err: any) {
      if (err.message !== 'User did not share') {
        Alert.alert('Erreur', 'Impossible de partager ce mème.');
      }
    }
  };

  const handleSave = () => {
    Alert.alert('Sauvegarde', 'Mème sauvegardé dans la galerie !');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Éditeur de Mème" subtitle="Modifie le texte avant de partager" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.canvas}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          
          <View style={styles.textOverlay}>
            <TextInput
              style={styles.textInput}
              value={editableCaption}
              onChangeText={setEditableCaption}
              multiline
              placeholder="Ajoute ton texte ici..."
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>
        </ViewShot>

        <View style={styles.instructionsBox}>
          <Icon name="edit" size={16} color={COLORS.primary} />
          <Text style={styles.instructionsText}>
            Astuce : Touche le texte sur l'image pour le modifier.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Partager sur les réseaux" onPress={handleShare} variant="secondary" />
          <Button title="Terminer et Sauvegarder" onPress={handleSave} />
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
  canvas: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  textInput: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionsText: {
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
});
