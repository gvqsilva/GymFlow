// app/(tabs)/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar, ScrollView, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { scheduleNextReminder } from '../../lib/notificationService';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
};

const WeeklySummaryGraph = ({ data }: { data: { [key: string]: number } }) => {
    const activities = Object.entries(data);
    const nameMapping: { [key: string]: string } = {
        'Musculação': 'Academia ',
        'Futebol Society': 'Futebol ',
        'Vólei de Quadra': 'Quadra ',
        'Vólei de Praia': 'Praia ',
        'Boxe': 'Boxe ',
    };
    if (activities.length === 0) {
        return (
            <View style={styles.graphContainer}>
                <Text style={styles.graphTitle}>Resumo da Semana</Text>
                <Text style={styles.noActivityText}>Nenhuma atividade registada esta semana.</Text>
            </View>
        );
    }
    const maxCount = Math.max(...activities.map(([, count]) => count), 1);
    return (
        <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Resumo da Semana </Text>
            <View style={styles.barGraphContainer}>
                {activities.map(([category, count]) => (
                    <View key={category} style={styles.barWrapper}>
                        <View style={styles.barItem}>
                            <Text style={styles.barLabelCount}>{count}x </Text>
                            <View style={[styles.bar, { height: `${(count / maxCount) * 100}%` }]} />
                        </View>
                        <Text style={styles.barLabelCategory}>{nameMapping[category] || category} </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function HomeScreen() {
    const { workouts, isLoading: isLoadingWorkouts, refreshWorkouts } = useWorkouts();
    const [userName, setUserName] = useState('Utilizador');
    const [weeklyGymWorkouts, setWeeklyGymWorkouts] = useState(0);
    const [creatineTaken, setCreatineTaken] = useState(false);
    const [wheyCount, setWheyCount] = useState(0);
    const [weeklySummary, setWeeklySummary] = useState<{ [key: string]: number }>({});
    const [nextWorkoutId, setNextWorkoutId] = useState('A');
    const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [todayActivities, setTodayActivities] = useState<any[]>([]);

    const isFocused = useIsFocused();

    const loadData = useCallback(async () => {
        try {
            const profileJSON = await AsyncStorage.getItem('userProfile');
            if (profileJSON) {
                const { name } = JSON.parse(profileJSON);
                setUserName(name || 'Utilizador');
            }

            const today = getLocalDateString();
            const creatineDate = await AsyncStorage.getItem('creatineDate');
            setCreatineTaken(creatineDate === today);

            const wheyDataJSON = await AsyncStorage.getItem('wheyData');
            if (wheyDataJSON) {
                const { count, date } = JSON.parse(wheyDataJSON);
                setWheyCount(date === today ? count : 0);
            } else {
                setWheyCount(0);
            }

            const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
            if (workoutHistoryJSON) {
                const history: { date: string, category: string, details: { calories?: number, type?: string } }[] = JSON.parse(workoutHistoryJSON);
                
                const startOfWeek = getStartOfWeek();
                const weeklyHistory = history.filter(entry => {
                    const entryDate = new Date(entry.date);
                    entryDate.setDate(entryDate.getDate() + 1);
                    return entryDate >= startOfWeek;
                });
                const gymWorkoutsThisWeek = weeklyHistory.filter(entry => entry.category === 'Musculação');
                setWeeklyGymWorkouts(gymWorkoutsThisWeek.length);
                const summary = weeklyHistory.reduce((acc, entry) => {
                    const category = entry.category || 'Outro';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {} as { [key: string]: number });
                setWeeklySummary(summary);

                const activitiesToday = history.filter(entry => entry.date === today);
                setTodayActivities(activitiesToday);

                const totalKcal = activitiesToday.reduce((sum, entry) => sum + (entry.details?.calories || 0), 0);
                setTotalCaloriesToday(totalKcal);

            } else {
                setWeeklyGymWorkouts(0);
                setWeeklySummary({});
                setTotalCaloriesToday(0);
                setTodayActivities([]);
            }

            const savedNextWorkoutId = await AsyncStorage.getItem('nextWorkoutId');
            setNextWorkoutId(savedNextWorkoutId || 'A');

        } catch (e) {
            console.error("Failed to load data.", e);
        }
    }, []);
    
    useEffect(() => {
        if (isFocused) {
            loadData();
            refreshWorkouts();
            scheduleNextReminder();
        }
    }, [isFocused, loadData, refreshWorkouts]);

    const handleCreatinePress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newStatus = !creatineTaken;
        setCreatineTaken(newStatus);
        try {
            if (newStatus) {
                await AsyncStorage.setItem('creatineDate', getLocalDateString());
            } else {
                await AsyncStorage.removeItem('creatineDate');
            }
            await scheduleNextReminder();
        } catch (e) { console.error("Failed to save creatine status.", e); }
    };

    const handleWheyIncrement = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newCount = wheyCount + 1;
        setWheyCount(newCount);
        try {
            await AsyncStorage.setItem('wheyData', JSON.stringify({ count: newCount, date: getLocalDateString() }));
        } catch (e) { console.error("Failed to save whey count.", e); }
    };

    const handleWheyDecrement = async () => {
        if (wheyCount <= 0) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newCount = wheyCount - 1;
        setWheyCount(newCount);
        try {
            await AsyncStorage.setItem('wheyData', JSON.stringify({ count: newCount, date: getLocalDateString() }));
        } catch (e) { console.error("Failed to save whey count.", e); }
    };

    const nextWorkoutName = isLoadingWorkouts ? 'A carregar...' : (workouts[nextWorkoutId]?.name || 'Treino');

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />
            <ScrollView>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingSmall}>Olá,</Text>
                        <Text style={styles.greetingLarge}>{userName}</Text>
                    </View>
                    <Text style={styles.workoutCount}>{`Acad. na semana: ${weeklyGymWorkouts}`} </Text>
                </View>

                <View style={styles.content}>
                    <Pressable style={styles.card} onPress={() => setIsDetailsModalVisible(true)}>
                        <View>
                            <Text style={styles.cardTitle}>Gasto Calórico</Text>
                            <Text style={styles.cardDose}>Estimativa de hoje</Text>
                        </View>
                        <View style={styles.caloriesDisplay}>
                            <Text style={styles.caloriesValue}>{totalCaloriesToday}</Text>
                            <Text style={styles.caloriesUnit}>kcal</Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.card} onPress={handleCreatinePress}>
                        <View>
                            <Text style={styles.cardTitle}>Creatina</Text>
                            <Text style={styles.cardDose}>Dose: 6g</Text>
                        </View>
                        <Text style={[styles.statusIcon, { color: creatineTaken ? 'green' : 'red' }]}>
                            {creatineTaken ? '✔' : '❌'}
                        </Text>
                    </Pressable>
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.cardTitle}>Whey</Text>
                            <Text style={styles.cardDose}>Dose: 30g </Text>
                        </View>
                        <View style={styles.wheyCounter}>
                            <Pressable onPress={handleWheyDecrement} style={styles.wheyButton}>
                                <Text style={styles.wheyArrow}>{'<'}</Text>
                            </Pressable>
                            <Text style={styles.wheyCountText}>{wheyCount}</Text>
                            <Pressable onPress={handleWheyIncrement} style={styles.wheyButton}>
                                <Text style={styles.wheyArrow}>{'>'}</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{nextWorkoutName}</Text>
                        <Link 
                            href={{
                                pathname: "/fichas/[id]",
                                params: { id: nextWorkoutId, title: nextWorkoutName }
                            }} 
                            asChild
                        >
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>Abrir ficha</Text>
                            </Pressable>
                        </Link>
                    </View>

                    <WeeklySummaryGraph data={weeklySummary} />
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isDetailsModalVisible}
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <Pressable style={styles.modalContainer} onPress={() => setIsDetailsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Detalhes do Gasto Calórico de Hoje </Text>
                        <FlatList
                            data={todayActivities}
                            keyExtractor={(item, index) => `${item.category}-${index}`}
                            renderItem={({ item }) => {
                                let activityDisplayName = item.category;
                                if (item.category === 'Musculação' && item.details?.type) {
                                    const workoutName = workouts && workouts[item.details.type] ? workouts[item.details.type].name : item.details.type;
                                    activityDisplayName = `Musculação (${workoutName})`;
                                }
                                return (
                                    <View style={styles.activityItem}>
                                        <Text style={styles.activityName}>
                                            {activityDisplayName} 
                                        </Text>
                                        <Text style={styles.activityCalories}>{item.details?.calories || 0} kcal </Text>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityTextModal}>Nenhuma atividade registada.</Text>}
                        />
                        <Pressable style={styles.closeButton} onPress={() => setIsDetailsModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: themeColor, paddingHorizontal: 25, paddingTop: 80, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    greetingSmall: { fontSize: 22, color: 'white', opacity: 0.8 },
    greetingLarge: { fontSize: 36, fontWeight: 'bold', color: 'white' },
    workoutCount: { fontSize: 16, color: 'white', fontWeight: '500', textAlign: 'right' },
    content: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 25, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, height: 95 },
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    cardDose: { fontSize: 14, color: 'gray', marginTop: 5 },
    statusIcon: { fontSize: 30 },
    wheyCounter: { flexDirection: 'row', alignItems: 'center' },
    wheyCountText: { fontSize: 28, fontWeight: 'bold', color: '#333', width: 40, textAlign: 'center' },
    wheyArrow: { fontSize: 24, color: 'gray' },
    wheyButton: { paddingHorizontal: 10 },
    button: { backgroundColor: themeColor, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
    buttonText: { color: 'white', fontWeight: 'bold' },
    graphContainer: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    graphTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    noActivityText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 16,
        paddingVertical: 40,
    },
    barGraphContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        marginTop: 10,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    barItem: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 35,
        backgroundColor: themeColor,
        borderRadius: 5,
    },
    barLabelCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    barLabelCategory: {
        marginTop: 8,
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
    },
    caloriesDisplay: {
        alignItems: 'flex-end',
    },
    caloriesValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: themeColor,
    },
    caloriesUnit: {
        fontSize: 14,
        color: 'gray',
    },
    // NOVOS ESTILOS para o modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        paddingBottom: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '40%',
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityName: {
        fontSize: 16,
        color: '#333',
    },
    activityCalories: {
        fontSize: 16,
        fontWeight: 'bold',
        color: themeColor,
    },
    noActivityTextModal: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 16,
        paddingVertical: 20,
    },
    closeButton: {
        backgroundColor: themeColor,
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

