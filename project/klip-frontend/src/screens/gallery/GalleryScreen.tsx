import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { MemeCard } from '../../components/meme/MemeCard';
import { Loader } from '../../components/common/Loader';
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
      if (pageNum === 1) {
        setMemes(res.data.memes);
      } else {
        setMemes((prev) => [...prev, ...res.data.memes]);
      }
      setTotalPages(res.data.totalPages);
    } catch {
      // erreur silencieuse
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

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
    return <Loader message="Chargement de la galerie..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma Galerie</Text>
      {memes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun mème dans la galerie</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
});
