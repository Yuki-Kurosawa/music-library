import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AlertWrap } from '@/components/ui/AlertWrap';
import { authenticatedApiCall, ServiceAPI } from '@/constants/Api';
import { Strings } from '@/constants/Strings';
import { useMetadata } from '@/contexts/MetadataContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category, Platforms as PlatformType, Song } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Create song using real API
const createSong = async (songData: Omit<Song, 'id'>): Promise<boolean> => {
  try {
    console.log('Creating new song:', songData);
    // 使用 authenticatedApiCall 函数发起请求
    const response = await authenticatedApiCall<Response>(
      ServiceAPI.CreateSong(songData),
      'POST',
      songData
    );
    return true;
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
const fetchPlatforms = async (): Promise<PlatformType[]> => {
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
  const { selectedMetadata, clearSelectedMetadata } = useMetadata();

  // Use Omit to represent a song that hasn't been saved yet
  const [song, setSong] = useState<Omit<Song, 'id'>>({
	artist: '',
	category_id: 1, // Default to first category
	add_time: Math.floor(Date.now() / 1000),
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<PlatformType[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSave = async () => {
	if (!song.artist) {
	  AlertWrap.alert(Strings.songForm.error, Strings.songForm.artistNeeded);
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

  // Use useFocusEffect to handle metadata selection when returning from search
  useFocusEffect(
	useCallback(() => {
	  if (selectedMetadata) {
		console.log('Metadata selected:', selectedMetadata);
		setSong(prevSong => ({
		  ...prevSong,
		  from_url: selectedMetadata.fromUrl,
		  image_url: selectedMetadata.imageUrl,
		}));
		// Clear the selected metadata after using it
		clearSelectedMetadata();
	  }
	}, [selectedMetadata, clearSelectedMetadata])
  );

  if (loading) {
	return (
	  <ThemedView style={styles.container}>
		<ThemedText>{Strings.songForm.loading}</ThemedText>
	  </ThemedView>
	);
  }

  return (
	<KeyboardAvoidingView
	  style={{ flex: 1 }}
	  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
	>
	  <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contentContainer}>
		<ThemedView style={styles.container}>
		  <ThemedText style={styles.label}>{Strings.songForm.title}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.title ?? ''}
			onChangeText={text => setSong(s => ({ ...s, title: text || undefined }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.titleHiragana}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.title_hiragana ?? ''}
			onChangeText={text => setSong(s => ({ ...s, title_hiragana: text || undefined }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.titleKatakana}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.title_katakana ?? ''}
			onChangeText={text => setSong(s => ({ ...s, title_katakana: text || undefined }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.titleRomaji}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.title_romaji ?? ''}
			onChangeText={text => setSong(s => ({ ...s, title_romaji: text || undefined }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.artist}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.artist}
			onChangeText={text => setSong(s => ({ ...s, artist: text }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.description}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.description ?? ''}
			onChangeText={text => setSong(s => ({ ...s, description: text }))}
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
			<View style={[styles.pickerRow, { borderColor }]}>
				<View style={{ flex: 1 }}>
				<Picker
					selectedValue={song.from_platform ?? 0}
					onValueChange={(itemValue) =>
					setSong(s => (s ? { ...s, from_platform: itemValue === 0 ? undefined : itemValue } : s))
					}
					style={{ color: textColor }}
					dropdownIconColor={textColor}
				>
					<Picker.Item label={Strings.songForm.selectPlatform} value={0} />
					{platforms.map(platform => <Picker.Item key={platform.id} label={platform.name} value={platform.id} />)}
				</Picker>
				</View>
				<TouchableOpacity
				style={{ marginLeft: 10, justifyContent: 'center' }}
				onPress={() => {
					if (song?.from_platform && song.title) {
					router.push({
						pathname: './search',
						params: { platform: song.from_platform, title: song.title }
					});
					} else {
					AlertWrap.alert(Strings.songForm.error, Strings.songForm.noPlatformOrTitle);
					}
				}}
				disabled={!song?.from_platform || !song.title}
				>
				<Ionicons name="search" size={24} color={(!song?.from_platform || !song.title) ? '#ccc' : textColor} />
				</TouchableOpacity>
			</View>

		  <ThemedText style={styles.label}>{Strings.songForm.fromUrl}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.from_url ?? ''}
			onChangeText={text => setSong(s => ({ ...s, from_url: text || undefined }))}
		  />

		  <ThemedText style={styles.label}>{Strings.songForm.imageUrl}</ThemedText>
		  <TextInput
			style={[styles.input, { color: textColor, borderColor }]}
			value={song.image_url ?? ''}
			onChangeText={text => setSong(s => ({ ...s, image_url: text || undefined }))}
		  />

		  <View style={styles.actionsContainer}>
			<Button title={saving ? Strings.songForm.creating : Strings.songForm.create} onPress={handleSave} disabled={saving} />
		  </View>
		</ThemedView>
	  </ScrollView>
	</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
	flex: 1,
  },
  contentContainer: {
	justifyContent:'space-around',
  },
  container: {
	flex: 1,
	padding: 20,
  },
  label: {
	marginBottom: 5,
	fontSize: 16,
  },  
  pickerRow: {
	flexDirection: 'row',
	alignItems: 'center',
	borderWidth: 1,
	borderRadius: 5,
	marginBottom: 20,
	justifyContent: 'center',
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