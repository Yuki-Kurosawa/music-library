import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AlertWrap } from '@/components/ui/AlertWrap';
import { ServiceAPI } from '@/constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, Platform, Song } from '@/types/database';
import { Strings } from '@/constants/Strings';

// Create song using real API
const createSong = async (songData: Omit<Song, 'id'>): Promise<boolean> => {
  try {
    console.log('Creating new song:', songData);
    const response = await fetch(ServiceAPI.CreateSong(songData), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songData),
    });
    
    if (response.ok) {
      return true;
    } else {
      console.error('Failed to create song:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error creating song:', error);
    return false;
  }
};

// Fetch categories using real API
const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories');
    const response = await fetch(ServiceAPI.GetCategories());
    
    if (response.ok) {
      const categories = await response.json();
      return categories;
    } else {
      console.error('Failed to fetch categories:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch platforms using real API
const fetchPlatforms = async (): Promise<Platform[]> => {
  try {
    console.log('Fetching platforms');
    const response = await fetch(ServiceAPI.GetPlatforms());
    
    if (response.ok) {
      const platforms = await response.json();
      return platforms;
    } else {
      console.error('Failed to fetch platforms:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }
};

export default function CreateSongScreen() {
  const router = useRouter();

  // Use Omit to represent a song that hasn't been saved yet
  const [song, setSong] = useState<Omit<Song, 'id'>>({
    artist: '',
    category_id: 1, // Default to first category
    add_time: Math.floor(Date.now() / 1000),
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSave = async () => {
    if (!song.artist) {
      AlertWrap.alert(Strings.songForm.error, Strings.songForm.artistPlaceholder);
      return;
    }
    setSaving(true);
    const success = await createSong(song);
    setSaving(false);
    if (success) {
      AlertWrap.alert(Strings.songForm.success, Strings.songForm.songCreated, [{ text: Strings.songForm.ok, onPress: () => router.back() }]);
    } else {
      AlertWrap.alert(Strings.songForm.error, Strings.songForm.failedToCreate);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, platformsData] = await Promise.all([
          fetchCategories(),
          fetchPlatforms()
        ]);
        
        setCategories(categoriesData);
        setPlatforms(platformsData);
        
        // Set default category_id to first available category
        if (categoriesData.length > 0) {
          setSong(s => ({ ...s, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        AlertWrap.alert(Strings.songForm.error, Strings.songForm.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{Strings.songForm.loading}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.label}>{Strings.songForm.title}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title: text || undefined }))}
          placeholder={Strings.songForm.songTitlePlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleHiragana}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_hiragana ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_hiragana: text || undefined }))}
          placeholder={Strings.songForm.titleHiraganaPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleKatakana}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_katakana ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_katakana: text || undefined }))}
          placeholder={Strings.songForm.titleKatakanaPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleRomaji}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_romaji ?? ''}
          onChangeText={text => setSong(s => ({ ...s, title_romaji: text || undefined }))}
          placeholder={Strings.songForm.titleRomajiPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.artist}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.artist}
          onChangeText={text => setSong(s => ({ ...s, artist: text }))}
          placeholder={Strings.songForm.artistPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.category}</ThemedText>
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

        <ThemedText style={styles.label}>{Strings.songForm.fromPlatform}</ThemedText>
        <View style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={song.from_platform ?? 0}
            onValueChange={(itemValue) =>
              setSong(s => ({ ...s, from_platform: itemValue === 0 ? undefined : itemValue }))
            }
            style={{ color: textColor }}
            dropdownIconColor={textColor}
          >
            <Picker.Item label={Strings.songForm.selectPlatform} value={0} />
            {platforms.map(platform => <Picker.Item key={platform.id} label={platform.name} value={platform.id} />)}
          </Picker>
        </View>

        <ThemedText style={styles.label}>{Strings.songForm.fromUrl}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.from_url ?? ''}
          onChangeText={text => setSong(s => ({ ...s, from_url: text || undefined }))}
          placeholder={Strings.songForm.sourceUrlPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.imageUrl}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.image_url ?? ''}
          onChangeText={text => setSong(s => ({ ...s, image_url: text || undefined }))}
          placeholder={Strings.songForm.imageUrlPlaceholder}
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