// app/_layout.tsx

import { Stack } from 'expo-router';

const themeColor = '#5a4fcf';

export default function RootLayout() {
  return (
    <Stack
        screenOptions={{
            headerStyle: { backgroundColor: themeColor },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="fichas/[id]" options={{ title: 'Detalhes do Treino' }} />
      <Stack.Screen name="fichas/exercicio" options={{ title: 'Exercício' }} />
    </Stack>
  );
}