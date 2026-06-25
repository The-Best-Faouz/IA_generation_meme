import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

type HomeNavProp = NativeStackNavigationProp<AppStackParamList>;

const MODES = [
  { key: 'ContextReader', label: 'Context Reader', icon: '📝', desc: 'Texte → Mème' },
  { key: 'StatusRemixer', label: 'Status Remixer', icon: '🖼️', desc: 'Image → Mème' },
  { key: 'Prompt', label: 'Prompt libre', icon: '💡', desc: 'Décris ton mème' },
  { key: 'FaceSwap', label: 'Face Swap', icon: '🎭', desc: 'Visage sur image' },
  { key: 'GifEditor', label: 'GIF Editor', icon: '🎬', desc: 'Édite un GIF' },
  { key: 'TelegramConnect', label: 'Telegram', icon: '✈️', desc: 'Lire & envoyer' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>KLIP</Text>
        <Text style={styles.slogan}>Clip it. Remix it. Send it.</Text>
      </View>

      <Text style={styles.sectionTitle}>Choisir un mode</Text>

      <View style={styles.grid}>
        {MODES.map((mode) => (
          <Button
            key={mode.key}
            title={`${mode.icon}  ${mode.label}`}
            onPress={() => navigation.navigate(mode.key as any)}
            style={styles.modeButton}
            textStyle={styles.modeButtonText}
          />
        ))}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  slogan: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  modeButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  modeButtonText: {
    fontSize: 16,
  },
});
