import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock data structure based on DATABASE.sql
type Song = {
  id: number;
  title: string;
  artist: string;
};

// In a real app, you'd fetch/update this via your API
const MOCK_SONGS: Song[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song Title ${i + 1}`,
  artist: `Artist ${i + 1}`,
}));

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
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Title</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={song.title}
        onChangeText={text => setSong(s => (s ? { ...s, title: text } : null))}
        placeholder="Song Title"
      />
      <ThemedText style={styles.label}>Artist</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={song.artist}
        onChangeText={text => setSong(s => (s ? { ...s, artist: text } : null))}
        placeholder="Artist Name"
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
  );
}

const styles = StyleSheet.create({
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
  actionsContainer: {
    marginTop: 20,
  },
  spacer: {
    height: 15,
  },
});