import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Music Library</ThemedText>
        <ThemedText type="subtitle" style={styles.version}>Version 1.0.0</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText style={styles.description}>
          A modern music library app built with React Native and Expo. 
          Manage your music collection, create playlists, and discover new music.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Features</ThemedText>
        <ThemedText style={styles.feature}>• Browse and organize your music</ThemedText>
        <ThemedText style={styles.feature}>• Create custom playlists</ThemedText>
        <ThemedText style={styles.feature}>• Admin panel for music management</ThemedText>
        <ThemedText style={styles.feature}>• Cross-platform support</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Developer</ThemedText>
        <ThemedText>Built with React Native & Expo</ThemedText>
        <ThemedText>Backend powered by .NET 8.0</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  version: {
    opacity: 0.7,
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    lineHeight: 20,
  },
  feature: {
    marginTop: 5,
    marginLeft: 10,
  },
});
