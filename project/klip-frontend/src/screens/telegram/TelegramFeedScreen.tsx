import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useTelegram } from '../../hooks/useTelegram';
import { Loader } from '../../components/common/Loader';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const TelegramFeedScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { messages, loading, getMessages } = useTelegram();

  useEffect(() => {
    getMessages();
  }, []);

  const handleKlip = (text: string) => {
    navigation.navigate('ContextReader' as any);
  };

  if (loading && messages.length === 0) {
    return <Loader message="Chargement des messages..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages Telegram</Text>
      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun message reçu</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.messageId.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageCard}>
              <Text style={styles.from}>{item.from}</Text>
              <Text style={styles.text}>{item.text}</Text>
              <TouchableOpacity onPress={() => handleKlip(item.text)} style={styles.klipButton}>
                <Text style={styles.klipText}>Klip ça !</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  from: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 12,
  },
  klipButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  klipText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
