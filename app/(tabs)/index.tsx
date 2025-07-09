import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ServiceAPI } from '@/constants/Api';
import { Song } from '@/types/database';

type Platform = {
  id: number;
  name: string;
};

export default function HomeScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ [songId: number]: number }>({});

  useEffect(() => {
    fetch(ServiceAPI.GetSongs(1))
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(ServiceAPI.GetPlatforms())
      .then(res => res.json())
      .then(data => setPlatforms(data));
  }, []);

  const handlePlatformChange = (songId: number, platformId: number) => {
    setSelectedPlatforms(prev => ({ ...prev, [songId]: platformId }));
    // Placeholder: Add play logic here if needed
  };

  const renderSong = ({ item }: { item: Song }) => (
    <View style={styles.songItem}>
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.songImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.songInfo}>
        <ThemedText type="default">{item.title}</ThemedText>
        <ThemedText type="subtitle">{item.artist}</ThemedText>
        <Picker
          selectedValue={selectedPlatforms[item.id] || ''}
          onValueChange={value => handlePlatformChange(item.id, Number(value))}
          style={styles.picker}
        >
          <Picker.Item label="Select platform to play" value="" />
          {platforms.map(platform => (
            <Picker.Item key={platform.id} label={platform.name} value={platform.id} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id.toString()}
          renderItem={renderSong}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    width: '100%',
  },
  listContent: {
    padding: 16,
    width: '100%',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff2',
    borderRadius: 8,
    padding: 8,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  songInfo: {
    flex: 1,
  },
  picker: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
});
