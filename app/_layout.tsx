// app/_layout.tsx

import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SportsProvider } from '../context/SportsProvider';
import * as Notifications from 'expo-notifications';

const themeColor = '#5a4fcf';

// 🔔 Configuração global das notificações (SDK 51+)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // substitui shouldShowAlert
    shouldShowList: true,   // mostra na central de notificações
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <SportsProvider>
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
        <Stack.Screen name="gerir-esportes" options={{ title: 'Gerir Esportes' }} />
        <Stack.Screen name="editar-ficha/[id]" options={{ title: 'Editar Ficha' }} />
        <Stack.Screen name="exercicio-modal" options={{ presentation: 'modal', title: 'Exercício' }} />
        <Stack.Screen name="ficha-modal" options={{ presentation: 'modal', title: 'Nova Ficha' }} />
        <Stack.Screen name="perfil-modal" options={{ presentation: 'modal', title: 'Meu Perfil' }} />
        <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />

        {/* ✅ Ecrãs de suplementos */}
        <Stack.Screen name="gerir-suplementos" options={{ title: 'Gerir Suplementos' }} />
        <Stack.Screen name="suplemento-modal" options={{ presentation: 'modal', title: 'Suplemento' }} />
      </Stack>

      <Toast />
    </SportsProvider>
  );
}