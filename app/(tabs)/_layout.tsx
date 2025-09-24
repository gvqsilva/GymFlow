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
        name="fichas"
        options={{
          title: 'Fichas',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? "document-text" : "document-text-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}