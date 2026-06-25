import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
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

  useEffect(() => {
    fetchMeme();
  }, [id]);

  const fetchMeme = async () => {
    try {
      const res = await api.get(`/gallery/${id}`);
      setMeme(res.data.meme);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      'Supprimer ce mème ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/gallery/${id}`);
              navigation.goBack();
            } catch {
              setError('Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !meme) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error || 'Mème introuvable'} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: meme.imageUrl }} style={styles.image} resizeMode="contain" />

      <View style={styles.info}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{meme.type.toUpperCase()}</Text>

        <Text style={styles.label}>Légende</Text>
        <Text style={styles.value}>{meme.caption}</Text>

        <Text style={styles.label}>Provider IA</Text>
        <Text style={styles.value}>{meme.aiProvider}</Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{new Date(meme.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Partager" variant="secondary" onPress={() => {}} />
        <Button title="Supprimer" variant="outline" onPress={handleDelete} />
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
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 20,
  },
  info: {
    gap: 8,
    marginBottom: 24,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
});
