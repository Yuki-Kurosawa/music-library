import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// This would be defined in a shared types file in a real app
type Song = {
  id: number;
  title: string;
  artist: string;
};

// In a real app, you'd post this to your API
const createSong = async (songData: Omit<Song, 'id'>): Promise<boolean> => {
  console.log('Creating new song:', songData);
  // Mock API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export default function CreateSongScreen() {
  const router = useRouter();

  // Use Omit to represent a song that hasn't been saved yet
  const [song, setSong] = useState<Omit<Song, 'id'>>({
    title: '',
    artist: '',
  });
  const [saving, setSaving] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSave = async () => {
    if (!song.title || !song.artist) {
      Alert.alert('Error', 'Please fill in all fields.');
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

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Title</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={song.title}
        onChangeText={text => setSong(s => ({ ...s, title: text }))}
        placeholder="Song Title"
      />
      <ThemedText style={styles.label}>Artist</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        value={song.artist}
        onChangeText={text => setSong(s => ({ ...s, artist: text }))}
        placeholder="Artist Name"
      />
      <View>
        <Button title={saving ? 'Creating...' : 'Create Song'} onPress={handleSave} disabled={saving} />
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
});