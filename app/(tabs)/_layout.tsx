// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
// Importa os dois pacotes de ícones
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColor,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // Usa o pacote Ionicons
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "home" : "home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fichas"
        options={{
          title: 'Fichas',
          // Usa o pacote Ionicons
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "document-text" : "document-text-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Configurações',
          // USA O PACOTE MATERIALCOMMUNITYICONS para despistar
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "cog" : "cog-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}