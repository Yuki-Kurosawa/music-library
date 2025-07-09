import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Song } from '@/types/database';

// In a real app, you'd fetch this via your API
const MOCK_SONGS: Song[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song Title ${i + 1}`,
  artist: `Artist ${i + 1}`,
  category_id: (i % 8) + 1, // Cycle through categories 1-8
  add_time: Math.floor(Date.now() / 1000) - i * 3600 * 24, // Songs added over the last 50 days
  image_url: `https://picsum.photos/seed/${i + 1}/100/100`,
}));

const PAGE_SIZE = 15;

const fetchSongs = async (page: number): Promise<{ data: Song[]; hasMore: boolean }> => {
  console.log(`Fetching page: ${page}`);
  // Mock API call with pagination
  return new Promise(resolve =>
    setTimeout(() => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const data = MOCK_SONGS.slice(start, end);
      const hasMore = end < MOCK_SONGS.length;
      resolve({ data, hasMore });
    }, 500)
  );
};

export default function AdminScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');

  useEffect(() => {
    setLoading(true);
    fetchSongs(page).then(result => {
      setSongs(result.data);
      setHasMore(result.hasMore);
      setLoading(false);
    });
  }, [page]);

  const renderItem = ({ item }: { item: Song }) => (
    <Link href={{ pathname: '/admin/edit', params: { songId: item.id } }} asChild>
      <Pressable style={styles.itemContainer}>
        {item.image_url && <Image source={{ uri: item.image_url }} style={styles.thumbnail} />}
        <View style={styles.songInfo}>
          <ThemedText type="subtitle">{item.title ?? 'Untitled'}</ThemedText>
          <ThemedText type="default" style={styles.artist}>
            {item.artist}
          </ThemedText>
        </View>
        <ThemedText>&gt;</ThemedText>
      </Pressable>
    </Link>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Manage Songs
      </ThemedText>
      <View style={styles.headerActions}>
        <Link href="/admin/create" asChild><Button title="Create New Song" /></Link>
      </View>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: itemSeparatorColor }]} />}
          style={styles.list}
        />
      )}
      <View style={styles.pagination}>
        <Button title="Previous" onPress={() => setPage(p => p - 1)} disabled={page === 1 || loading} />
        <ThemedText style={styles.pageNumber}>Page {page}</ThemedText>
        <Button title="Next" onPress={() => setPage(p => p + 1)} disabled={!hasMore || loading} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Adjust for status bar
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  headerActions: {
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artist: {
    opacity: 0.7,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  pageNumber: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
