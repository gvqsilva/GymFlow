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
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "home" : "home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="esportes"
        options={{
          title: 'Esportes',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "barbell" : "barbell-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "cog" : "cog-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}