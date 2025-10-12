// app/(tabs)/config.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications'; 
// REMOVIDAS as importações de AsyncStorage, DateTimePicker e scheduleNextReminder

const themeColor = '#5a4fcf';

// O handler de notificações permanece, pois é uma configuração global do Expo
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior;
  },
});

export default function SettingsScreen() {
    const router = useRouter();

    // REMOVIDA: Toda a lógica de estado e funções relacionadas ao lembrete de creatina.

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, title: "Configurações", headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }} />
            <ScrollView style={styles.container}>
                
                <Pressable style={styles.linkCard} onPress={() => router.push('/perfil')}>
                    <View>
                        <Text style={styles.cardTitle}>Meu Perfil</Text>
                        <Text style={styles.cardSubtitle}>Consulte os seus dados e progresso</Text>
                    </View>
                </Pressable>

                {/* Este card leva ao Gerir Suplementos, onde agora está o lembrete */}
                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-suplementos')}>
                    <View>
                        <Text style={styles.cardTitle}>Gerir Suplementos</Text>
                        <Text style={styles.cardSubtitle}>Adicione, edite ou apague suplementos</Text>
                    </View>
                </Pressable>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-fichas')}>
                    <View>
                        <Text style={styles.cardTitle}>Gerenciar Fichas de Treino</Text>
                        <Text style={styles.cardSubtitle}>Adicione, edite ou apague exercícios</Text>
                    </View>
                </Pressable>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-esportes')}>
                    <View>
                        <Text style={styles.cardTitle}>Gerir Esportes</Text>
                        <Text style={styles.cardSubtitle}>Adicione ou remova modalidades</Text>
                    </View>
                </Pressable>
                
                <Pressable style={styles.linkCard} onPress={() => router.push('/gestao-dados')}>
                    <View>
                        <Text style={styles.cardTitle}>Histórico e Dados</Text>
                        <Text style={styles.cardSubtitle}>Consulte e apague o seu histórico</Text>
                    </View>
                </Pressable>
                
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { padding: 20 },
    // O estilo 'card' foi mantido para consistência, mas o card do lembrete foi removido.
    linkCard: {
        backgroundColor: 'white', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3,
    },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 14, color: 'gray', marginTop: 5 },
    // REMOVIDO: O estilo reminderTimeText
});