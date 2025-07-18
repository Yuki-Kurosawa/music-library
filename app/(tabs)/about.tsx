import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">音楽ライブラリ</ThemedText>
        <ThemedText type="subtitle" style={styles.version}>バージョン 1.0.1</ThemedText>
      </ThemedView>    

      <ThemedView style={styles.section}>
		<ThemedText type="subtitle">開発チーム：</ThemedText>
		<ThemedText>黒澤　ゆき <Link href="https://x.com/YukiKurosawaDev">@YukiKurosawaDev</Link></ThemedText>
		<ThemedText>佐々木　友奈 <Link href="https://x.com/YukiKurosawaDev">@YuunaSasakiDev</Link></ThemedText>
		<ThemedText>一ノ瀬　百合 <Link href="https://x.com/YukiKurosawaDev">@YuriIchinoseDev</Link></ThemedText>
		<ThemedText>一ノ瀬　佑芽 <Link href="https://x.com/YukiKurosawaDev">@YumeIchinoseDev</Link></ThemedText>
        <ThemedText>&copy; Copyright 2025 All rights Reserved</ThemedText>
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
