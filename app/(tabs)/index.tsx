// app/(tabs)/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { scheduleNextReminder } from '../../lib/notificationService'; // Importa a nossa nova função

const themeColor = '#5a4fcf';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const WorkoutGraph = ({ data }: { data: { [key: string]: number } }) => {
    const counts = Object.values(data);
    const maxCount = Math.max(...counts, 1);

    return (
        <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Distribuição de Treinos no Mês</Text>
            <View style={styles.graph}>
                <View style={styles.barArea}>
                    {Object.entries(data).map(([type, count]) => (
                        <View key={type} style={styles.barWrapper}>
                            <View style={[styles.bar, { height: `${(count / maxCount) * 100}%` }]} />
                        </View>
                    ))}
                </View>
                <View style={styles.labelArea}>
                    {Object.entries(data).map(([type, count]) => (
                        <View key={type} style={styles.labelWrapper}>
                            <Text style={styles.barLabel}>{count}</Text>
                            <Text style={styles.barTypeLabel}>{type}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default function HomeScreen() {
    const [userName] = useState('Gabriel');
    const [monthlyWorkouts, setMonthlyWorkouts] = useState(0);
    const [creatineTaken, setCreatineTaken] = useState(false);
    const [wheyCount, setWheyCount] = useState(0);
    const [workoutDistribution, setWorkoutDistribution] = useState({ A: 0, B: 0, C: 0 });
    const [nextWorkout, setNextWorkout] = useState('A');

    const isFocused = useIsFocused();

    const loadData = useCallback(async () => {
        try {
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
                const history: {date: string, type: string}[] = JSON.parse(workoutHistoryJSON);
                const currentMonth = new Date().getMonth();
                const monthlyHistory = history.filter(entry => new Date(entry.date).getMonth() === currentMonth);
                setMonthlyWorkouts(monthlyHistory.length);
                const distribution = monthlyHistory.reduce((acc, entry) => {
                    const type = entry.type as keyof typeof acc;
                    if (acc[type] !== undefined) acc[type]++;
                    return acc;
                }, { A: 0, B: 0, C: 0 });
                setWorkoutDistribution(distribution);
            } else {
                setMonthlyWorkouts(0);
                setWorkoutDistribution({ A: 0, B: 0, C: 0 });
            }

            const savedNextWorkout = await AsyncStorage.getItem('nextWorkoutId');
            setNextWorkout(savedNextWorkout || 'A');

        } catch (e) {
            console.error("Failed to load data.", e);
        }
    }, []);

    // Atualiza o agendamento de notificações sempre que a tela fica em foco
    useEffect(() => {
        if (isFocused) {
            loadData();
            scheduleNextReminder();
        }
    }, [isFocused, loadData]);

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
            // Após alterar o estado da creatina, reagenda a notificação
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />
            <ScrollView>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingSmall}>Olá,</Text>
                        <Text style={styles.greetingLarge}>{userName}</Text>
                    </View>
                    <Text style={styles.workoutCount}>{`Total de treinos\nno mês: ${monthlyWorkouts}`}</Text>
                </View>

                <View style={styles.content}>
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
                            <Text style={styles.cardDose}>Dose: 30g</Text>
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
                        <Text style={styles.cardTitle}>Treino {nextWorkout}</Text>
                        <Link 
                            href={{
                                pathname: "/fichas/[id]",
                                params: { id: nextWorkout }
                            }} 
                            asChild
                        >
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>Abrir ficha</Text>
                            </Pressable>
                        </Link>
                    </View>

                    <WorkoutGraph data={workoutDistribution} />
                </View>
            </ScrollView>
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
    graph: { height: 150 },
    barArea: { flexDirection: 'row', flex: 1, justifyContent: 'space-around', alignItems: 'flex-end' },
    barWrapper: { flex: 1, alignItems: 'center' },
    bar: { backgroundColor: themeColor, width: 35, borderRadius: 5 },
    labelArea: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 5 },
    labelWrapper: { flex: 1, alignItems: 'center' },
    barLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    barTypeLabel: { fontSize: 14, color: 'gray' },
});

