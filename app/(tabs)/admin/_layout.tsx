import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Song' }} />
      <Stack.Screen name="create" options={{ title: 'Create Song' }} />
    </Stack>
  );
}