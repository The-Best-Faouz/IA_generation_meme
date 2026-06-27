import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Icon } from '../../components/common/Icon';
import { useTelegram } from '../../hooks/useTelegram';
import { Loader } from '../../components/common/Loader';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const TelegramFeedScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { messages, loading, getMessages } = useTelegram();

  useEffect(() => { getMessages().catch(() => {}); }, []);

  const handleKlip = () => navigation.navigate('ContextReader');

  if (loading && messages.length === 0) return <Loader message="Chargement des messages..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Messages Telegram" subtitle="Messages recus par ton bot" />
      {messages.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Icon name="telegram" size={36} color={COLORS.surfaceLight} />
          </View>
          <Text style={styles.emptyText}>Aucun message recu</Text>
          <Text style={styles.emptyHint}>
            Envoie un message a ton bot Telegram pour le voir apparaitre ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.messageId ?? item.date ?? Math.random())}
          renderItem={({ item }) => (
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.fromIcon}>
                  <Icon name="telegram" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.from}>{item.from}</Text>
              </View>
              <Text style={styles.text}>{item.text}</Text>
              <TouchableOpacity onPress={handleKlip} style={styles.klipButton} activeOpacity={0.7}>
                <Icon name="sparkle" size={14} color={COLORS.white} />
                <Text style={styles.klipText}>Creer un meme</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyHint: {
    color: COLORS.surfaceLight,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fromIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  from: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  klipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  klipText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
