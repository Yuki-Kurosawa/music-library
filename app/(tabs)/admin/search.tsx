import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServiceAPI } from '@/constants/Api';
import { Metadata } from '@/types/database';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function SearchScreen() {
  const router = useRouter();
  const { platform, title } = useLocalSearchParams<{ platform?: string; title?: string }>();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Metadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platform || !title) return;
    setLoading(true);
    setError(null);
    fetch(ServiceAPI.GetMetadatas(Number(platform), title))
      .then(async res => {
        if (!res.ok) throw new Error('网络请求失败');
        return res.json();
      })
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [platform, title]);

  const handleSelect = (item: Metadata) => {
    // 回传数据给上一个页面
    router.back();
    setTimeout(() => {
      // 通过事件或全局状态管理更优，这里用window事件简单实现
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('metadataSelected', { detail: item }));
      }
    }, 100);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>搜索结果</ThemedText>
      {loading && <ActivityIndicator size="large" />}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      {!loading && !error && (
        <FlatList
          data={results}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <Text style={styles.itemTitle}>{item.title || '无标题'}</Text>
              <Text style={styles.itemArtist}>{item.artist}</Text>
              {item.from_url ? <Text style={styles.itemUrl}>{item.from_url}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<ThemedText>无结果</ThemedText>}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  error: { color: 'red', marginBottom: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemArtist: { fontSize: 14, color: '#666' },
  itemUrl: { fontSize: 12, color: '#888' },
});