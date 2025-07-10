import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ServiceAPI } from '@/constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Song } from '@/types/database';

const SEARCH_TYPES = [
  { label: '标题', value: 'title' },
  { label: '歌手', value: 'artist' },
];

const fetchSongs = async (page: number, searchType: string, keyword: string): Promise<{ data: Song[]; hasMore: boolean }> => {
  try {
    let url = keyword
      ? ServiceAPI.SearchSongs(searchType, encodeURIComponent(keyword), page)
      : ServiceAPI.GetSongs(page);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
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

  // 搜索相关
  const [searchType, setSearchType] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');

  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSongs(page, searchType, keyword);
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
  }, [page, searchType, keyword]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(inputKeyword.trim());
  };

  const renderItem = ({ item }: { item: Song }) => (
    <Link href="/#" asChild>
      <Pressable style={styles.itemContainer}>
        {item.image_url && <Image source={{ uri: item.image_url }} style={styles.thumbnail} />}
        <View style={styles.songInfo}>
          <ThemedText type="subtitle">{item.title ?? 'Untitled'}</ThemedText>
          <ThemedText type="default" style={styles.artist}>
            {item.artist}
          </ThemedText>
        </View>
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
        Music Library
      </ThemedText>
      {/* 搜索区域 */}
      <View style={styles.searchBar}>
        <Picker
          selectedValue={searchType}
          style={styles.picker}
          onValueChange={setSearchType}
        >
          {SEARCH_TYPES.map(type => (
            <Picker.Item key={type.value} label={type.label} value={type.value} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="请输入关键字"
          value={inputKeyword}
          onChangeText={setInputKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button title="搜索" onPress={handleSearch} />
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
    paddingTop: 50,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  picker: {
    flex: 0.8,
    height: 40,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 2,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: '#fff',
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
