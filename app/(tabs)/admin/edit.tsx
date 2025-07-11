import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AlertWrap } from '@/components/ui/AlertWrap';
import { ServiceAPI } from '@/constants/Api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, Platform as PlatformType, Song } from '@/types/database';
import { Strings } from '@/constants/Strings';

const fetchCategories = async (): Promise<Category[]> => {
  console.log('Fetching categories');
  try {
    const response = await fetch(ServiceAPI.GetCategories());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const fetchPlatforms = async (): Promise<PlatformType[]> => {
  console.log('Fetching platforms');
  try {
    const response = await fetch(ServiceAPI.GetPlatforms());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }
};

const fetchSongDetails = async (id: number): Promise<Song | undefined> => {
  console.log(`Fetching song: ${id}`);
  try {
    const response = await fetch(ServiceAPI.GetSong(id));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching song details:', error);
    return undefined;
  }
};

const saveSongDetails = async (song: Song): Promise<boolean> => {
  console.log('Saving song:', song);
  try {
    const response = await fetch(ServiceAPI.UpdateSong(song.id, song), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving song:', error);
    return false;
  }
};

const deleteSong = async (id: number): Promise<boolean> => {
  console.log('Deleting song:', id);
  try {
    const response = await fetch(ServiceAPI.DeleteSong(id), {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting song:', error);
    return false;
  }
};

export default function EditSongScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams();
  const id = Number(songId);

  const [song, setSong] = useState<Song | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<PlatformType[]>([]);
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
      AlertWrap.alert(Strings.songForm.success, Strings.songForm.songSaved, [{ text: Strings.songForm.ok, onPress: () => router.back() }]);
    } else {
      AlertWrap.alert(Strings.songForm.error, Strings.songForm.failedToSave);
    }
  };

  const handleDelete = () => {
    if (!song) return;

    AlertWrap.alert(
      Strings.songForm.deleteConfirmTitle,
      Strings.songForm.deleteConfirmMessage(song.title ?? ''),
      [
        { text: Strings.songForm.cancel, style: 'cancel' },
        {
          text: Strings.songForm.delete,
          style: 'destructive',
          onPress: async () => {
            if (!song) return;
            setDeleting(true);
            const success = await deleteSong(song.id);
            setDeleting(false);
            if (success) {
              // Use replace to prevent navigating back to the deleted item's page
              AlertWrap.alert(Strings.songForm.success, Strings.songForm.songDeleted, [{ text: Strings.songForm.ok, onPress: () => router.replace('/admin') }]);
            } else {
              AlertWrap.alert(Strings.songForm.error, Strings.songForm.failedToDelete);
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
        <ThemedText>{Strings.songForm.notFound}</ThemedText>
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
          onChangeText={text => setSong(s => (s ? { ...s, title: text } : null))}
          placeholder={Strings.songForm.songTitlePlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleHiragana}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_hiragana ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_hiragana: text } : null))}
          placeholder={Strings.songForm.titleHiraganaPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleKatakana}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_katakana ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_katakana: text } : null))}
          placeholder={Strings.songForm.titleKatakanaPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.titleRomaji}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.title_romaji ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, title_romaji: text } : null))}
          placeholder={Strings.songForm.titleRomajiPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.artist}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.artist}
          onChangeText={text => setSong(s => (s ? { ...s, artist: text } : null))}
          placeholder={Strings.songForm.artistPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.category}</ThemedText>
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

        <ThemedText style={styles.label}>{Strings.songForm.fromPlatform}</ThemedText>
        <View style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={song.from_platform ?? 0}
            onValueChange={(itemValue) =>
              setSong(s => (s ? { ...s, from_platform: itemValue === 0 ? undefined : itemValue } : null))
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
          onChangeText={text => setSong(s => (s ? { ...s, from_url: text } : null))}
          placeholder={Strings.songForm.sourceUrlPlaceholder}
        />

        <ThemedText style={styles.label}>{Strings.songForm.imageUrl}</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          value={song.image_url ?? ''}
          onChangeText={text => setSong(s => (s ? { ...s, image_url: text } : null))}
          placeholder={Strings.songForm.imageUrlPlaceholder}
        />

        <View style={styles.actionsContainer}>
          <Button title={saving ? Strings.songForm.saving : Strings.songForm.save} onPress={handleSave} disabled={saving || deleting} />
          <View style={styles.spacer} />
          <Button
            title={deleting ? Strings.songForm.deleting : Strings.songForm.delete}
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