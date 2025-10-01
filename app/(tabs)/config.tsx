// app/(tabs)/config.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Switch, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { scheduleNextReminder } from '../../lib/notificationService';

const themeColor = '#5a4fcf';

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
    const [isReminderEnabled, setIsReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
    const [showTimePicker, setShowTimePicker] = useState(false);

    const loadReminderSettings = useCallback(async () => {
        try {
            const settingsJSON = await AsyncStorage.getItem('reminderSettings');
            if (settingsJSON) {
                const { enabled, time } = JSON.parse(settingsJSON);
                setIsReminderEnabled(enabled);
                setReminderTime(new Date(time));
            }
        } catch (e) {
            console.error("Failed to load reminder settings.", e);
        }
    }, []);

    useEffect(() => {
        loadReminderSettings();
    }, [loadReminderSettings]);
    
    const handleSettingsChange = async (enabled: boolean, time: Date) => {
        const newSettings = { enabled, time: time.toISOString() };
        await AsyncStorage.setItem('reminderSettings', JSON.stringify(newSettings));
        await scheduleNextReminder();
        
        if (enabled) {
            Alert.alert("Sucesso!", `Lembrete atualizado.`);
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert("Lembrete Desativado", "As notificações de creatina foram canceladas.");
        }
    };

    const handleToggleReminder = (value: boolean) => {
        setIsReminderEnabled(value);
        handleSettingsChange(value, reminderTime);
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (event.type === 'set' && selectedDate) {
            setReminderTime(selectedDate);
            handleSettingsChange(isReminderEnabled, selectedDate);
        }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, title: "Configurações", headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }} />
            <ScrollView style={styles.container}>
                
                {/* NOVO CARD PARA O PERFIL */}
                <Pressable style={styles.linkCard} onPress={() => router.push('/perfil-modal')}>
                    <View>
                        <Text style={styles.cardTitle}>Meu Perfil </Text>
                        <Text style={styles.cardSubtitle}>Edite o seu nome e peso </Text>
                    </View>
                </Pressable>

                <View style={styles.card}>
                    <View>
                        <Text style={styles.cardTitle}>Lembrete de Creatina</Text>
                        <Pressable onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.reminderTimeText}>
                                Todos os dias às {formatTime(reminderTime)} 
                            </Text>
                        </Pressable>
                    </View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isReminderEnabled ? themeColor : "#f4f3f4"}
                        onValueChange={handleToggleReminder}
                        value={isReminderEnabled}
                    />
                </View>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-fichas')}>
                    <View>
                        <Text style={styles.cardTitle}>Gerir Fichas de Musculação </Text>
                        <Text style={styles.cardSubtitle}>Adicione, edite ou apague exercícios </Text>
                    </View>
                </Pressable>
                
                {showTimePicker && (
                    <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={onChangeTime}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { padding: 20 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
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
    reminderTimeText: { fontSize: 16, color: themeColor, marginTop: 5, fontWeight: 'bold' },
});

