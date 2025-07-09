import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ServiceAPI } from '@/constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Song } from '@/types/database';

const fetchSongs = async (page: number): Promise<{ data: Song[]; hasMore: boolean }> => {
  console.log(`Fetching page: ${page}`);
  
  try {
    const response = await fetch(ServiceAPI.GetSongs(page));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Assuming the API returns data in format: { songs: Song[], hasMore: boolean }
    // Adjust this based on your actual API response structure
    return {
      data: result.songs || result.data || result,
      hasMore: result.hasMore ?? (result.songs?.length > 0 || result.data?.length > 0 || result.length > 0)
    };
  } catch (error) {
    console.error('Error fetching songs:', error);
    return { data: [], hasMore: false };
  }
};

export default function AdminScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchSongs(page);
        setSongs(result.data);
        setHasMore(result.hasMore);
      } catch (err) {
        setError('Failed to load songs. Please try again.');
        console.error('Error loading songs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
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

  const renderContent = () => {
    if (loading && page === 1) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Button title="Retry" onPress={() => setPage(1)} />
        </View>
      );
    }

    if (songs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No songs found</ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: itemSeparatorColor }]} />}
        style={styles.list}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Manage Songs
      </ThemedText>
      <View style={styles.headerActions}>
        <Link href="/admin/create" asChild>
          <Button title="Create New Song" />
        </Link>
      </View>
      
      {renderContent()}
      
      <View style={styles.pagination}>
        <Button 
          title="Previous" 
          onPress={() => setPage(p => p - 1)} 
          disabled={page === 1 || loading} 
        />
        <ThemedText style={styles.pageNumber}>Page {page}</ThemedText>
        <Button 
          title="Next" 
          onPress={() => setPage(p => p + 1)} 
          disabled={!hasMore || loading} 
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
