import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { AppHeader } from '../../components/common/AppHeader';
import { MemeCard } from '../../components/meme/MemeCard';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface MemeItem {
  id: string;
  imageUrl: string;
  type: string;
  createdAt: string;
}

export const GalleryScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMemes = async (pageNum: number = 1) => {
    try {
      const res = await api.get(`/gallery?page=${pageNum}&limit=20`);
      const newMemes = res.data?.memes ?? [];
      if (pageNum === 1) {
        setMemes(newMemes);
      } else {
        setMemes((prev) => [...prev, ...newMemes]);
      }
      setTotalPages(res.data?.totalPages ?? 1);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchMemes(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchMemes(1);
  };

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMemes(nextPage);
    }
  };

  if (loading && memes.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Ma Galerie" />
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>{memes.length} memes</Text>
      </View>
      {memes.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Icon name="gallery" size={40} color={COLORS.surfaceLight} />
          </View>
          <Text style={styles.emptyText}>Aucun meme dans la galerie</Text>
          <Text style={styles.emptyHint}>Genere ton premier meme depuis l accueil</Text>
        </View>
      ) : (
        <FlatList
          data={memes}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemeCard
              imageUrl={item.imageUrl}
              type={item.type}
              onPress={() => navigation.navigate('MemeDetail', { id: item.id })}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
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
  subtitleRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    marginTop: 6,
  },
});
