import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
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
  icon: 'chat' | 'image' | 'sparkle' | 'swap' | 'gif' | 'telegram' | 'mic';
  color: string;
  badge?: string;
}

interface QuickAction {
  screen: keyof AppStackParamList;
  label: string;
  desc: string;
  icon: 'import' | 'notification' | 'chat';
  color: string;
}

const FEATURES: FeatureCard[] = [
  { screen: 'ContextReader', label: 'Context Reader', desc: 'Texte en meme instantané', icon: 'chat', color: '#38bdf8', badge: 'Populaire' },
  { screen: 'VoiceMeme', label: 'Note Vocale', desc: 'Meme créé après transcription', icon: 'mic', color: '#2dd4bf', badge: 'Nouveau' },
  { screen: 'FaceSwap', label: 'Face Swap', desc: 'Échange magique de visages', icon: 'swap', color: '#f43f5e' },
  { screen: 'Prompt', label: 'Prompt libre', desc: 'Décris ton meme de rêve', icon: 'sparkle', color: '#f59e0b' },
  { screen: 'StatusRemixer', label: 'Status Remixer', desc: 'Ajoute du texte IA sur image', icon: 'image', color: '#a855f7' },
  { screen: 'GifEditor', label: 'GIF Editor', desc: 'Édite un GIF à la voix', icon: 'gif', color: '#10b981' },
  { screen: 'TelegramConnect', label: 'Telegram Bot', desc: 'Connecte ton propre bot', icon: 'telegram', color: '#3b82f6' },
];

const QUICK_ACTIONS: QuickAction[] = [
  { screen: 'ChatImport', label: 'WhatsApp', desc: 'Remix de conversation', icon: 'chat', color: '#25D366' },
  { screen: 'NotificationFeed', label: 'Discussions', desc: 'Suggestions en direct', icon: 'notification', color: '#0ea5e9' },
  { screen: 'ShareIntentHandler', label: 'Partages', desc: 'Contenu reçu externe', icon: 'import', color: '#f59e0b' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Hero Brand Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <AnimatedLogo />
          </View>
          <Text style={styles.heroTitle}>KLIP Studio</Text>
          <Text style={styles.heroSubtitle}>Crée des memes légendaires propulsés par l'IA</Text>
          <View style={styles.glowAura} />
        </View>

        {/* Live Banner / Meme of the Day */}
        <TouchableOpacity 
          style={styles.trendingBanner} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Prompt')}
        >
          <View style={styles.trendingBadge}>
            <Icon name="sparkle" size={12} color={COLORS.white} />
            <Text style={styles.trendingBadgeText}>Tendance</Text>
          </View>
          <View style={styles.trendingTextContainer}>
            <Text style={styles.trendingTitle}>Remix le code de ton projet en meme !</Text>
            <Text style={styles.trendingDesc}>Essaie le Prompt Libre pour exprimer ta frustration du dev 💻</Text>
          </View>
          <View style={styles.trendingArrow}>
            <Icon name="play" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderIndicator} />
          <Text style={styles.sectionTitle}>Flux & Importations</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.quickAction}
              onPress={() => navigation.navigate(action.screen as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Icon name={action.icon} size={18} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <Text style={styles.quickActionDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderIndicatorPrimary} />
          <Text style={styles.sectionTitle}>Créateurs de Memes</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.screen}
              style={styles.featureCard}
              onPress={() => navigation.navigate(feature.screen as any)}
              activeOpacity={0.8}
            >
              {feature.badge && (
                <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                </View>
              )}
              
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                <Icon name={feature.icon} size={24} color={feature.color} />
              </View>

              <View style={styles.featureTextContent}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureDesc} numberOfLines={2}>{feature.desc}</Text>
              </View>

              {/* Glowing decorative left stripe */}
              <View style={[styles.cardDecorStripe, { backgroundColor: feature.color }]} />
              
              {/* Arrow Indicator */}
              <View style={styles.cardArrow}>
                <Icon name="play" size={10} color={COLORS.textMuted} />
              </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  
  // Hero section styling
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    position: 'relative',
    paddingVertical: 12,
  },
  logoContainer: {
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 32,
  },
  glowAura: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    zIndex: -1,
  },

  // Trending Banner
  trendingBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  trendingBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  trendingBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  trendingTextContainer: {
    flex: 1,
    gap: 2,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  trendingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  trendingArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
  },
  sectionHeaderIndicatorPrimary: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Quick Actions Styling (horizontal cards)
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },

  // Features Grid Styling (premium list-cards layout)
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureBadge: {
    position: 'absolute',
    top: 0,
    right: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featureBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContent: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  cardDecorStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardArrow: {
    opacity: 0.5,
  },
});
