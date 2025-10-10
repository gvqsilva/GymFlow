// app/gerir-suplementos.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, SafeAreaView, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSupplements, Supplement } from '../hooks/useSupplements';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as Notifications from 'expo-notifications'; 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; 
import { scheduleNextReminder } from '../lib/notificationService'; // CORREÇÃO: O caminho foi ajustado

const themeColor = '#5a4fcf';

// Configura o handler de notificações
Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        } as Notifications.NotificationBehavior;
    },
});

export default function ManageSupplementsScreen() {
    const { supplements, isLoading, deleteSupplement, refreshSupplements } = useSupplements();
    const router = useRouter();

    // LÓGICA DO LEMBRETE DE CREATINA
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
    // FIM DA LÓGICA DO LEMBRETE

    useFocusEffect(
        React.useCallback(() => {
            refreshSupplements();
        }, [])
    );

    const handleDelete = (supplement: Supplement) => {
        Alert.alert(
            `Apagar "${supplement.name}"?`,
            "Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: () => deleteSupplement(supplement.id) }
            ]
        );
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColor} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Gerir Suplementos' }} />
            <ScrollView contentContainerStyle={{paddingBottom: 80}}>

                <Text style={styles.sectionHeader}>Lembretes</Text>

                {/* CARD DO LEMBRETE DE CREATINA */}
                <View style={[styles.card, { marginTop: 20 }]}>
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

                <Text style={styles.sectionHeader}>Meus Suplementos</Text>

                <FlatList
                    data={supplements}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.info}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle}>{`${item.dose}${item.unit}`} - {item.trackingType === 'daily_check' ? 'Marcação diária' : 'Contador'}</Text>
                            </View>
                            <View style={styles.actions}>
                                <Pressable onPress={() => router.push({ pathname: '/suplemento-modal', params: { id: item.id } })}>
                                    <Ionicons name="pencil" size={24} color={themeColor} />
                                </Pressable>
                                <Pressable style={{ marginLeft: 20 }} onPress={() => handleDelete(item)}>
                                    <Ionicons name="trash-outline" size={24} color="red" />
                                </Pressable>
                            </View>
                        </View>
                    )}
                    scrollEnabled={false}
                />

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
            
            <Pressable style={styles.addButton} onPress={() => router.push('/suplemento-modal')}>
                <Ionicons name="add" size={32} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10, paddingHorizontal: 20 },
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
    info: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
    reminderTimeText: { fontSize: 16, color: themeColor, marginTop: 5, fontWeight: 'bold' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: themeColor, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});