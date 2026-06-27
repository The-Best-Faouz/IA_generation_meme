import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const MemeDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [meme, setMeme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchMeme(); }, [id]);

  const fetchMeme = async () => {
    try {
      const res = await api.get(`/gallery/${id}`);
      setMeme(res.data.meme);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    }
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce meme ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/gallery/${id}`);
          navigation.goBack();
        } catch { setError('Erreur lors de la suppression'); }
      }},
    ]);
  };

  if (loading) return <Loader />;
  if (error || !meme) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Details" />
        <ErrorMessage message={error || 'Meme introuvable'} />
      </View>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    text: '#0ea5e9',
    image: '#8b5cf6',
    prompt: '#f59e0b',
    gif: '#10b981',
    faceswap: '#ec4899',
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Details du meme" />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: meme.imageUrl }} style={styles.image} resizeMode="contain" />

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[meme.type] || COLORS.primary) + '20' }]}>
              <Text style={[styles.typeText, { color: TYPE_COLORS[meme.type] || COLORS.primary }]}>
                {(meme.type ?? '').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {meme.createdAt ? new Date(meme.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date inconnue'}
            </Text>
          </View>

          <View style={styles.divider} />

          {meme.caption && (
            <>
              <View style={styles.infoHeader}>
                <Icon name="chat" size={14} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Legende</Text>
              </View>
              <Text style={styles.infoValue}>{meme.caption}</Text>
            </>
          )}

          {meme.aiProvider && (
            <>
              <View style={styles.infoHeader}>
                <Icon name="sparkle" size={14} color={COLORS.warning} />
                <Text style={styles.infoLabel}>Provider IA</Text>
              </View>
              <Text style={styles.infoValue}>{meme.aiProvider}</Text>
            </>
          )}
        </View>

        <View style={styles.actions}>
          <Button title="Partager" variant="secondary" onPress={() => {}} />
          <Button title="Supprimer" variant="outline" onPress={handleDelete} />
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
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});
