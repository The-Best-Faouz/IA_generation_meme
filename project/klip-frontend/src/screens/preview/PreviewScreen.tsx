import React from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { TextOverlay } from '../../components/meme/TextOverlay';
import Share from 'react-native-share';
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
  const { imageUrl, caption } = route.params as RouteParams;

  const handleShare = async () => {
    try {
      await Share.open({
        url: imageUrl,
        message: caption || 'Regarde ce mème généré avec KLIP !',
      });
    } catch {
      // utilisateur a annulé
    }
  };

  const handleSave = () => {
    Alert.alert('Sauvegardé', 'Sticker sauvegardé dans la galerie !');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        {caption ? <TextOverlay text={caption} position="bottom" /> : null}
      </View>

      {caption ? (
        <Text style={styles.caption}>{caption}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button title="Partager" onPress={handleShare} variant="secondary" />
        <Button title="Sauvegarder" onPress={handleSave} />
      </View>
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
  caption: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
  },
});
