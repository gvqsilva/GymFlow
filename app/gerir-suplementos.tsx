// app/gerir-suplementos.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, SafeAreaView, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSupplements, Supplement } from '../hooks/useSupplements';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as Notifications from 'expo-notifications'; 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; 
import { scheduleAllReminders } from '../lib/notificationService';
import Toast from 'react-native-toast-message';

const themeColor = '#5a4fcf';
const REMINDERS_KEY = 'all_supplement_reminders';

// ✅ CORRIGIDO: Configura o handler de notificações com as novas propriedades
Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowBanner: true, // Mostra o banner no topo (Android)
            shouldShowList: true,   // Mostra na lista de notificações (iOS)
            shouldPlaySound: true,
            shouldSetBadge: false,
        } as Notifications.NotificationBehavior;
    },
});

interface ReminderSettings {
    [supplementId: string]: {
        enabled: boolean;
        time: string;
        supplementName: string;
    };
}

export default function ManageSupplementsScreen() {
    const { supplements, isLoading, deleteSupplement, refreshSupplements } = useSupplements();
    const router = useRouter();

    const [reminders, setReminders] = useState<ReminderSettings>({});
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [editingReminderFor, setEditingReminderFor] = useState<Supplement | null>(null);

    const loadReminders = useCallback(async () => {
        const remindersJSON = await AsyncStorage.getItem(REMINDERS_KEY);
        setReminders(remindersJSON ? JSON.parse(remindersJSON) : {});
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshSupplements();
            loadReminders();
        }, [refreshSupplements, loadReminders])
    );

    const handleUpdateReminder = async (supplement: Supplement, newSettings: { enabled: boolean; time: Date }) => {
        const updatedReminders = {
            ...reminders,
            [supplement.id]: {
                enabled: newSettings.enabled,
                time: newSettings.time.toISOString(),
                supplementName: supplement.name,
            }
        };
        setReminders(updatedReminders);
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
        await scheduleAllReminders();
    };

    const handleTimePress = (supplement: Supplement) => {
        setEditingReminderFor(supplement);
        setShowTimePicker(true);
    };

    const handleToggleReminder = (supplement: Supplement) => {
        const currentReminder = reminders[supplement.id];
        const newEnabledStatus = !currentReminder?.enabled;
        const time = currentReminder ? new Date(currentReminder.time) : new Date(new Date().setHours(8, 0, 0, 0));
        
        handleUpdateReminder(supplement, { enabled: newEnabledStatus, time });

        Toast.show({
            type: newEnabledStatus ? 'success' : 'info',
            text1: `Lembrete para ${supplement.name} ${newEnabledStatus ? 'ativado' : 'desativado'}.`
        });
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (event.type === 'set' && selectedDate && editingReminderFor) {
            handleUpdateReminder(editingReminderFor, { enabled: true, time: selectedDate });
            Toast.show({
                type: 'success',
                text1: `Lembrete para ${editingReminderFor.name} atualizado.`
            });
        }
        setEditingReminderFor(null);
    };

    const handleDelete = (supplement: Supplement) => {
        Alert.alert( `Apagar "${supplement.name}"?`, "Esta ação não pode ser desfeita.",
            [{ text: "Cancelar" }, { text: "Apagar", style: "destructive", onPress: () => deleteSupplement(supplement.id) }]
        );
    };
    
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColor} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Gerir Suplementos' }} />
            <ScrollView contentContainerStyle={{paddingBottom: 80}}>
                <Text style={styles.sectionHeader}>Meus Suplementos e Lembretes</Text>

                <FlatList
                    data={supplements}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => {
                        const reminder = reminders[item.id];
                        const isReminderEnabled = reminder?.enabled ?? false;
                        const reminderTimeDate = reminder ? new Date(reminder.time) : new Date(new Date().setHours(8, 0, 0, 0));

                        return (
                            <View style={styles.card}>
                                <View style={styles.info}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <Text style={styles.cardSubtitle}>{`${item.dose}${item.unit}`}</Text>
                                </View>
                                
                                <View style={styles.reminderControls}>
                                    <Pressable onPress={() => handleTimePress(item)}>
                                        <Text style={[styles.reminderTimeText, { color: isReminderEnabled ? themeColor : 'gray' }]}>
                                            {formatTime(reminderTimeDate)}
                                        </Text>
                                    </Pressable>
                                    <Switch
                                        trackColor={{ false: "#ccc", true: "#81b0ff" }}
                                        thumbColor={isReminderEnabled ? themeColor : "#f4f3f4"}
                                        onValueChange={() => handleToggleReminder(item)}
                                        value={isReminderEnabled}
                                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                    />
                                </View>
                                
                                <View style={styles.actions}>
                                    <Pressable onPress={() => router.push({ pathname: '/suplemento-modal', params: { id: item.id } })}>
                                        <Ionicons name="pencil-outline" size={24} color={'#3498db'} />
                                    </Pressable>
                                    <Pressable style={{ marginLeft: 15 }} onPress={() => handleDelete(item)}>
                                        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }}
                    scrollEnabled={false}
                />

                {showTimePicker && editingReminderFor && (
                    <DateTimePicker
                        value={reminders[editingReminderFor.id] ? new Date(reminders[editingReminderFor.id].time) : new Date()}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={onChangeTime}
                    />
                )}
            </ScrollView>
            
            <Pressable style={styles.addButton} onPress={() => router.push('/suplemento-modal')}>
                <Ionicons name="add" size={32} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 15, paddingHorizontal: 20 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 20, 
        marginHorizontal: 20, 
        marginBottom: 15, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        elevation: 2 
    },
    info: { flex: 1, marginRight: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
    reminderControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    reminderTimeText: { 
        fontSize: 16, 
        fontWeight: 'bold',
        marginRight: 5,
    },
    actions: { flexDirection: 'row', alignItems: 'center' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: themeColor, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});