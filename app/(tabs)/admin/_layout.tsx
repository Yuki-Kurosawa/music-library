import { Strings } from '@/constants/Strings';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: Strings.adminLayout.editSong }} />
      <Stack.Screen name="create" options={{ title: Strings.adminLayout.createSong }} />
    </Stack>
  );
}