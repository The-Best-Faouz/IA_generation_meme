import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { AppHeader } from '../../components/common/AppHeader';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { Icon } from '../../components/common/Icon';
import { COLORS } from '../../constants/colors';

type HomeNavProp = NativeStackNavigationProp<AppStackParamList>;

interface FeatureCard {
  screen: keyof AppStackParamList;
  label: string;
  desc: string;
  icon: 'chat' | 'image' | 'sparkle' | 'swap' | 'gif' | 'sticker' | 'telegram';
  color: string;
}

interface QuickAction {
  screen: keyof AppStackParamList;
  label: string;
  desc: string;
  icon: 'import' | 'notification' | 'chat';
}

const FEATURES: FeatureCard[] = [
  { screen: 'ContextReader', label: 'Context Reader', desc: 'Transforme un texte en meme', icon: 'chat', color: '#0ea5e9' },
  { screen: 'StatusRemixer', label: 'Status Remixer', desc: 'Ajoute du texte a une image', icon: 'image', color: '#8b5cf6' },
  { screen: 'Prompt', label: 'Prompt libre', desc: 'Decris le meme de tes reves', icon: 'sparkle', color: '#f59e0b' },
  { screen: 'FaceSwap', label: 'Face Swap', desc: 'Echange des visages', icon: 'swap', color: '#ec4899' },
  { screen: 'GifEditor', label: 'GIF Editor', desc: 'Edite un GIF a la voix', icon: 'gif', color: '#10b981' },
  { screen: 'StickerStudio', label: 'Sticker Studio', desc: 'Transforme un sticker', icon: 'sticker', color: '#06b6d4' },
  { screen: 'TelegramConnect', label: 'Telegram', desc: 'Connecte ton bot', icon: 'telegram', color: '#3b82f6' },
];

const QUICK_ACTIONS: QuickAction[] = [
  { screen: 'ShareIntentHandler', label: 'Contenu partage', desc: 'Depuis une autre app', icon: 'import' },
  { screen: 'NotificationFeed', label: 'Flux discussions', desc: 'Suggestions automatiques', icon: 'notification' },
  { screen: 'ChatImport', label: 'Import WhatsApp', desc: 'Analyse une conversation', icon: 'chat' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.screen}
            style={styles.quickAction}
            onPress={() => navigation.navigate(action.screen as any)}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Icon name={action.icon} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
            <Text style={styles.quickActionDesc}>{action.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Creer un meme</Text>

      <View style={styles.featuresGrid}>
        {FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature.screen}
            style={styles.featureCard}
            onPress={() => navigation.navigate(feature.screen as any)}
            activeOpacity={0.7}>
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
              <Icon name={feature.icon} size={22} color={feature.color} />
            </View>
            <Text style={styles.featureLabel}>{feature.label}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
            <View style={[styles.featureAccent, { backgroundColor: feature.color }]} />
          </TouchableOpacity>
        ))}
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
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  featureAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
