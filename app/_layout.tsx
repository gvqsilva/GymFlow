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
      <Stack.Screen name="musculacao" options={{ title: 'Fichas de Treino' }} />
      <Stack.Screen name="logEsporte" options={{ title: 'Registar Atividade' }} />
      <Stack.Screen name="gerir-fichas" options={{ title: 'Gerir Fichas' }} />
      <Stack.Screen name="editar-ficha/[id]" options={{ title: 'Editar Ficha' }} />
      <Stack.Screen name="exercicio-modal" options={{ presentation: 'modal', title: 'Exercício' }} />
      <Stack.Screen name="ficha-modal" options={{ presentation: 'modal', title: 'Nova Ficha' }} />

      {/* NOVA ROTA PARA O PERFIL */}
      <Stack.Screen name="perfil-modal" options={{ presentation: 'modal', title: 'Meu Perfil' }} />
    </Stack>
  );
}

