import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ImageURLMap, ServiceAPI } from '@/constants/Api';
import { Strings } from '@/constants/Strings';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, Song } from '@/types/database';

const SEARCH_TYPES = Strings.home.searchTypes;

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(ServiceAPI.GetCategories());
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const fetchSongs = async (
  page: number,
  searchType: string,
  keyword: string,
  categoryId: number | null
): Promise<{ data: Song[]; hasMore: boolean }> => {
  try {
    let url =
      keyword || (categoryId && categoryId > 0)
        ? ServiceAPI.SearchSongs(
            searchType,
            categoryId ?? 0,
            encodeURIComponent(keyword),
            page
          )
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const itemSeparatorColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSongs(page, searchType, keyword, selectedCategory);
        setSongs(result.data);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(Strings.home.failedToLoad);
        console.error('Error loading songs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, [page, searchType, keyword, selectedCategory]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(inputKeyword.trim());
  };

  const renderItem = ({ item }: { item: Song }) => {
    const category = categories.find(c => c.id === item.category_id);
    return (
      <Link href={ item.from_url } asChild>
        <Pressable style={styles.itemContainer}>
          {item.image_url && <Image source={{ uri: ImageURLMap(item.image_url) }} style={styles.thumbnail} />}
          <View style={styles.songInfo}>
            <ThemedText type="subtitle" style={[styles.subtitle]}>{item.title ?? Strings.home.untitled}</ThemedText>            
            {item.description && (
              <ThemedText type="default" style={styles.description}>
                {item.description}
              </ThemedText>
            )}
			<ThemedText type="default" style={styles.artist}>
              {Strings.home.artist}
            </ThemedText>
			<ThemedText type="default" style={styles.artist}>
              {item.artist}
            </ThemedText>
          </View>
          {/* Move category to top-right corner */}
          {category && (
            <ThemedText type="default" style={styles.category}>
              {category.name}
            </ThemedText>
          )}
        </Pressable>
      </Link>
    );
  };

  const renderContent = () => {
    if (loading && page === 1) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Button title={Strings.home.retry} onPress={() => setPage(1)} />
        </View>
      );
    }
    if (songs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>{Strings.home.noSongs}</ThemedText>
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
        {Strings.home.pageTitle}
      </ThemedText>
      {/* 搜索区域三行 */}
      <View style={styles.searchBarColumn}>		
        <View style={styles.searchRow}>
          <Picker
            selectedValue={selectedCategory ?? 0}
            style={styles.picker}
            onValueChange={value => setSelectedCategory(value === 0 ? null : value)}
          >
            <Picker.Item label={Strings.home.allCategories} value={0} />
            {categories.map(category => (
              <Picker.Item key={category.id} label={category.name} value={category.id} />
            ))}
          </Picker>
        </View>
        <View style={styles.searchRow}>
          <Picker
            selectedValue={searchType}
            style={styles.picker}
            onValueChange={setSearchType}
          >
            {SEARCH_TYPES.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={inputKeyword}
            onChangeText={setInputKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <Button title={Strings.home.searchButton} onPress={handleSearch} />
      </View>
      {renderContent()}
      <View style={styles.pagination}>
        <Button
          title={Strings.home.previous}
          onPress={() => setPage(p => p - 1)}
          disabled={page === 1 || loading}
        />
        <ThemedText style={styles.pageNumber}>{Strings.home.page} {page}</ThemedText>
        <Button
          title={Strings.home.next}
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
    textAlign: 'left',
    marginBottom: 20,
  },
  searchBarColumn: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  picker: {
    flex: 1,
	borderWidth: 2,
    borderRadius: 5,
	borderColor: '#ccc',
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#267fcf',
    backgroundColor: '#319df8', 
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative', // Add relative positioning to itemContainer
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  subtitle: {
    color: '#fff', 
    fontSize: 20,
  },
  artist: {
    marginTop: 1,
    color: '#fff', 
    fontSize: 14
  },
  category: {
    position: 'absolute', 
    top: -18, 
    right: 15, 
    color: '#fff', 
	borderRadius: 12,
    borderWidth: 5,
    borderColor: '#267fcf',
    backgroundColor: '#ac24fa',    
    elevation: 5,
	paddingLeft:10,
	paddingRight:10,
    fontSize: 16 
  },
  description: {
    marginTop: 4,
    color: '#fff', 
	fontSize: 16,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#d429ff',
    backgroundColor: '#d94fff',
	paddingHorizontal:5
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
