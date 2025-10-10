// app/(tabs)/historico.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';
const CREATINE_HISTORY_KEY = 'creatineHistory';
const WHEY_HISTORY_KEY = 'wheyHistory';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function HistoryScreen() {
    const { workouts } = useWorkouts();
    const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
    const [creatineHistory, setCreatineHistory] = useState<Record<string, boolean>>({});
    const [wheyHistory, setWheyHistory] = useState<Record<string, number>>({});
    const [selectedDayActivities, setSelectedDayActivities] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadAllHistory = async () => {
                const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
                setWorkoutHistory(workoutHistoryJSON ? JSON.parse(workoutHistoryJSON) : []);
                const creatineHistoryJSON = await AsyncStorage.getItem(CREATINE_HISTORY_KEY);
                setCreatineHistory(creatineHistoryJSON ? JSON.parse(creatineHistoryJSON) : {});
                const wheyHistoryJSON = await AsyncStorage.getItem(WHEY_HISTORY_KEY);
                setWheyHistory(wheyHistoryJSON ? JSON.parse(wheyHistoryJSON) : {});
            };
            loadAllHistory();
        }, [])
    );

    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        workoutHistory.forEach(entry => {
            const dateStr = entry.date;
            if (marked[dateStr]) {
                if (marked[dateStr].dots.length < 3) {
                    marked[dateStr].dots.push({ color: themeColor });
                }
            } else {
                marked[dateStr] = { marked: true, dots: [{ color: themeColor }] };
            }
        });
        return marked;
    }, [workoutHistory]);

    const onDayPress = (day: { dateString: string }) => {
        const activitiesOnDay = workoutHistory.filter(entry => entry.date === day.dateString);
        setSelectedDayActivities(activitiesOnDay);
        setSelectedDay(day.dateString);
        setIsModalVisible(true);
    };

    const creatineOnSelectedDay = creatineHistory[selectedDay];
    const wheyOnSelectedDay = wheyHistory[selectedDay] || 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: true, title: "Histórico", headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }} />
            <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{ selectedDayBackgroundColor: themeColor, arrowColor: themeColor, todayTextColor: themeColor, dotColor: themeColor }}
            />

            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <Pressable style={styles.modalContainer} onPress={() => setIsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Resumo do Dia</Text>
                        <Text style={styles.activitiesTitle}>Suplementação</Text>
                        <View style={styles.supplementsSection}>
                            <View style={styles.supplementItem}>
                                <Text style={styles.supplementName}>Creatina </Text>
                                {creatineOnSelectedDay ? (
                                    <View style={styles.statusContainer}><Ionicons name="checkmark-circle" size={20} color="#2ecc71" /><Text style={[styles.supplementStatus, {color: '#2ecc71'}]}>Tomada</Text></View>
                                ) : (
                                    <View style={styles.statusContainer}><Ionicons name="close-circle" size={20} color="#e74c3c" /><Text style={[styles.supplementStatus, {color: '#e74c3c'}]}>Não Tomada</Text></View>
                                )}
                            </View>
                            <View style={styles.supplementItem}><Text style={styles.supplementName}>Whey Protein </Text><Text style={styles.supplementStatus_whey}>{wheyOnSelectedDay} dose(s)</Text></View>
                        </View>

                        <Text style={styles.activitiesTitle}>Atividades Físicas</Text>
                        <FlatList
                            data={selectedDayActivities}
                            keyExtractor={(item) => item.id || `${item.category}-${Math.random()}`}
                            renderItem={({ item }) => {
                                const workoutName = workouts[item.details?.type]?.name || item.details?.type;
                                const activityName = item.category === 'Musculação' ? `${item.category} (${workoutName})` : item.category;
                                const duration = item.details?.duration;
                                // ALTERADO: Lógica para mostrar os detalhes
                                const isSwimmingWithDistance = item.category.toLowerCase() === 'natação' && item.details?.distance > 0;
                                
                                return (
                                    <View style={styles.activityItem}>
                                        <Text style={styles.activityName}>{activityName} </Text>
                                        <View style={styles.detailsContainer}>
                                            {isSwimmingWithDistance && <Text style={styles.activityDetail}>{item.details.distance} m</Text>}
                                            {duration && <Text style={styles.activityDetail}>{duration} min </Text>}
                                        </View>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma atividade registada.</Text>}
                        />
                        <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}><Text style={styles.closeButtonText}>Fechar</Text></Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    calendar: { margin: 10, borderRadius: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 22, paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: '40%', maxHeight: '80%'},
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    supplementsSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
    supplementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, },
    supplementName: { fontSize: 16, color: '#333' },
    supplementStatus: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
    supplementStatus_whey: { fontSize: 16, fontWeight: 'bold', color: themeColor },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    activitiesTitle: { fontSize: 20, fontWeight: 'bold', color: '#555', marginBottom: 10, textAlign: 'center' },
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
    activityName: { fontSize: 16, color: '#333' },
    // NOVO
    detailsContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    activityDetail: { fontSize: 14, color: 'gray', fontWeight: '500' },
    noActivityText: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 20 },
    closeButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, marginTop: 20, alignItems: 'center' },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});