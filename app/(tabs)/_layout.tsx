// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

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
      {/* ABA DE ALIMENTAÇÃO */}
      <Tabs.Screen
        name="historico" // Corresponde ao ficheiro historico.tsx
        options={{
          title: 'Alimentação',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "restaurant" : "restaurant-outline"} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "settings" : "settings-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}