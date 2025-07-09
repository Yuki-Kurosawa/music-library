import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, PlatformType, Song } from '@/types/database';

// In a real app, you'd fetch/update this via your API
const MOCK_SONGS: Song[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song Title ${i + 1}`,
  artist: `Artist ${i + 1}`,
  category_id: (i % 8) + 1, // Cycle through categories 1-8
  add_time: Math.floor(Date.now() / 1000) - i * 3600 * 24, // Songs added over the last 50 days
  image_url: `https://picsum.photos/seed/${i + 1}/100/100`,
}));

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'POPS&アニメ', name_english: 'POPS&ANIME' },
  { id: 2, name: 'niconico&ボーカロイド', name_english: 'NICONICO&VOCALOID' },
  { id: 3, name: '東方Project', name_english: 'TOUHOU Project' },
  { id: 4, name: 'ゲーム＆バラエティ', name_english: 'GAME&VARIETY' },
  { id: 5, name: 'maimai', name_english: 'maimai' },
  { id: 6, name: 'オンゲキ', name_english: 'ONGEKI' },
  { id: 7, name: 'CHUNITHM', name_english: 'CHUNITHM' },
  { id: 8, name: 'イロドリミドリ', name_english: 'IRODORIMIDORI' },
];

const fetchCategories = async (): Promise<Category[]> => {
  console.log('Fetching categories');
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(MOCK_CATEGORIES), 200));
};

const MOCK_PLATFORMS: Platform[] = [
  { id: 1, name: 'YouTube', type: PlatformType.Video, url: 'https://www.youtube.com/results?search_query=' },
  { id: 2, name: 'NicoVideo', type: PlatformType.Video, url: 'https://www.nicovideo.jp/search/' },
  { id: 3, name: 'Bilibili', type: PlatformType.Video, url: 'https://search.bilibili.com/all?keyword=' },
  { id: 4, name: 'Amazon Music', type: PlatformType.Music, url: 'https://www.amazon.co.jp/s?k=' },
];

const fetchPlatforms = async (): Promise<Platform[]> => {
  console.log('Fetching platforms');
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(MOCK_PLATFORMS), 200));
};


const fetchSongDetails = async (id: number): Promise<Song | undefined> => {
  console.log(`Fetching song: ${id}`);
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(MOCK_SONGS.find(s => s.id === id)), 300));
};

const saveSongDetails = async (song: Song): Promise<boolean> => {
  console.log('Saving song:', song);
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

const deleteSong = async (id: number): Promise<boolean> => {
  console.log('Deleting song:', id);
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export default function EditSongScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams();
  const id = Number(songId);

  const [song, setSong] = useState<Song | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSongDetails(id).then(data => {
      if (data) {
        setSong(data);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchPlatforms().then(setPlatforms);
  }, []);

  const handleSave = async () => {
    if (!song) return;
    setSaving(true);
    const success = await saveSongDetails(song);
    setSaving(false);
    if (success) {
      Alert.alert('Success', 'Song details saved.', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert('Error', 'Failed to save song details.');
    }
  };

  const handleDelete = () => {
    if (!song) return;

    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!song) return;
            setDeleting(true);
            const success = await deleteSong(song.id);
            setDeleting(false);
            if (success) {
              // Use replace to prevent navigating back to the deleted item's page
              Alert.alert('Success', 'Song deleted successfully.', [{ text: 'OK', onPress: () => router.replace('/admin') }]);
            } else {
              Alert.alert('Error', 'Failed to delete song.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!song) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Song not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.label}>Title</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title: text } : null))}
          placeholder="Song Title"
        />

        <ThemedText style={styles.label}>Title (Hiragana)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_hiragana ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_hiragana: text } : null))}
          placeholder="Title in Hiragana"
        />

        <ThemedText style={styles.label}>Title (Katakana)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_katakana ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_katakana: text } : null))}
          placeholder="Title in Katakana"
        />

        <ThemedText style={styles.label}>Title (Romaji)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_romaji ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_romaji: text } : null))}
          placeholder="Title in Romaji"
        />

        <ThemedText style={styles.label}>Artist</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.artist}
          onChangeText={text => setSong(s => (s ? { ...s, artist: text } : null))}
          placeholder="Artist Name"
        />

        <ThemedText style={styles.label}>Category</ThemedText>
        <View style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={song.category_id}
            onValueChange={(itemValue) =>
              setSong(s => (s ? { ...s, category_id: itemValue } : null))
            }
            style={{ color: textColor }}
            dropdownIconColor={textColor}
          >
            {categories.map(category => (
              <Picker.Item key={category.id} label={`${category.name} (${category.name_english})`} value={category.id} />
            ))}
          </Picker>
        </View>

        <ThemedText style={styles.label}>From Platform (Optional)</ThemedText>
        <View style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={song.from_platform ?? 0}
            onValueChange={(itemValue) =>
              setSong(s => (s ? { ...s, from_platform: itemValue === 0 ? undefined : itemValue } : null))
            }
            style={{ color: textColor }}
            dropdownIconColor={textColor}
          >
            <Picker.Item label="-- Select a Platform --" value={0} />
            {platforms.map(platform => <Picker.Item key={platform.id} label={platform.name} value={platform.id} />)}
          </Picker>
        </View>

        <ThemedText style={styles.label}>From URL</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.from_url ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, from_url: text } : null))}
          placeholder="Source URL"
        />

        <ThemedText style={styles.label}>Image URL</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.image_url ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, image_url: text } : null))}
          placeholder="Image URL"
        />

        <View style={styles.actionsContainer}>
          <Button title={saving ? 'Saving...' : 'Save'} onPress={handleSave} disabled={saving || deleting} />
          <View style={styles.spacer} />
          <Button
            title={deleting ? 'Deleting...' : 'Delete Song'}
            color={Platform.OS === 'ios' ? 'red' : '#f44336'}
            onPress={handleDelete}
            disabled={saving || deleting}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    justifyContent: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  spacer: {
    height: 15,
  },
});