import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, Platform, PlatformType, Song } from '@/types/database';

// In a real app, you'd post this to your API
const createSong = async (songData: Omit<Song, 'id'>): Promise<boolean> => {
  console.log('Creating new song:', songData);
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

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


export default function CreateSongScreen() {
  const router = useRouter();

  // Use Omit to represent a song that hasn't been saved yet
  const [song, setSong] = useState<Omit<Song, 'id'>>({
    artist: '',
    category_id: 1, // Default to 'POPS&ANIME'
    add_time: Math.floor(Date.now() / 1000),
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [saving, setSaving] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSave = async () => {
    if (!song.artist) {
      Alert.alert('Error', 'Please provide an artist name.');
      return;
    }
    setSaving(true);
    const success = await createSong(song);
    setSaving(false);
    if (success) {
      Alert.alert('Success', 'Song created successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert('Error', 'Failed to create song.');
    }
  };

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchPlatforms().then(setPlatforms);
  }, []);

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.label}>Title</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title: text || undefined }))}
          placeholder="Song Title"
        />

        <ThemedText style={styles.label}>Title (Hiragana)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_hiragana ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_hiragana: text || undefined }))}
          placeholder="Title in Hiragana"
        />

        <ThemedText style={styles.label}>Title (Katakana)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_katakana ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_katakana: text || undefined }))}
          placeholder="Title in Katakana"
        />

        <ThemedText style={styles.label}>Title (Romaji)</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_romaji ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_romaji: text || undefined }))}
          placeholder="Title in Romaji"
        />

        <ThemedText style={styles.label}>Artist</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.artist}
          onChangeText={text => setSong(s => ({ ...s, artist: text }))}
          placeholder="Artist Name"
        />

        <ThemedText style={styles.label}>Category</ThemedText>
        <View style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={song.category_id}
            onValueChange={(itemValue) =>
              setSong(s => ({ ...s, category_id: itemValue }))
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
              setSong(s => ({ ...s, from_platform: itemValue === 0 ? undefined : itemValue }))
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
          onChangeText={text => setSong(s => ({ ...s, from_url: text || undefined }))}
          placeholder="Source URL"
        />

        <ThemedText style={styles.label}>Image URL</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.image_url ?? ''}
          onChangeText={text => setSong(s => ({ ...s, image_url: text || undefined }))}
          placeholder="Image URL"
        />

        <View style={styles.actionsContainer}>
          <Button title={saving ? 'Creating...' : 'Create Song'} onPress={handleSave} disabled={saving} />
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
});