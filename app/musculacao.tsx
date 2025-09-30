// app/musculacao.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link, Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkouts } from '../hooks/useWorkouts';
import { Workout } from '../constants/workoutData';

const themeColor = '#5a4fcf';

// GRÁFICO DE FREQUÊNCIA MENSAL (LÓGICA CORRIGIDA)
const WorkoutTypeSummary = ({ history, workouts }: { history: any[], workouts: Record<string, Workout> }) => {
    const workoutIds = Object.keys(workouts).sort((a, b) => 
        (workouts[a]?.name || '').localeCompare(workouts[b]?.name || '')
    );
    
    const typeCounts: { [key: string]: number } = {};
    workoutIds.forEach(id => typeCounts[id] = 0);

    const currentMonth = new Date().getMonth();

    const monthlyMusculacaoHistory = history.filter(entry => {
        const entryDate = new Date(entry.date);
        const adjustedEntryDate = new Date(entryDate.valueOf() + entryDate.getTimezoneOffset() * 60 * 1000);
        return entry.category === 'Musculação' && adjustedEntryDate.getMonth() === currentMonth;
    });

    monthlyMusculacaoHistory.forEach(entry => {
        const type = entry.details?.type;
        if (type && typeCounts[type] !== undefined) {
            typeCounts[type]++;
        }
    });
    
    const maxCount = Math.max(...Object.values(typeCounts), 1);

    return (
        <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Frequência no Mês</Text>
            <View style={styles.barGraphContainer}>
                {workoutIds.map((id) => {
                    const count = typeCounts[id];
                    const workout = workouts[id];
                    if (!workout) return null;
                    
                    // LÓGICA ATUALIZADA: Extrai a letra ou o nome final da ficha
                    let label = workout.name;
                    const nameParts = workout.name.split(' ');
                    if (nameParts.length > 1) {
                        label = nameParts[nameParts.length - 1]; // Pega na última parte (ex: "A" de "Treino A")
                    }
                    
                    return (
                        <View key={id} style={styles.barWrapper}>
                            <View style={styles.barItem}>
                                <Text style={styles.barLabelCount}>{count}x</Text>
                                <View style={[styles.bar, { height: `${(count / maxCount) * 100}%` }]} />
                            </View>
                            <Text style={styles.barLabelCategory}>{label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};


export default function MusculacaoScreen() {
    const { workouts, isLoading: isLoadingWorkouts, refreshWorkouts } = useWorkouts();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    useFocusEffect(
      useCallback(() => {
        refreshWorkouts();
        const loadHistory = async () => {
          setIsLoadingHistory(true);
          const historyJSON = await AsyncStorage.getItem('workoutHistory');
          setHistory(historyJSON ? JSON.parse(historyJSON) : []);
          setIsLoadingHistory(false);
        };
        loadHistory();
      }, [refreshWorkouts])
    );

    const isLoading = isLoadingWorkouts || isLoadingHistory;

    if (isLoading) {
        return (
            <View style={styles.container}>
                 <Stack.Screen options={{ title: 'Fichas de Musculação' }} />
                <ActivityIndicator size="large" color={themeColor} style={{ marginTop: 30 }}/>
            </View>
        );
    }

    const workoutsList = Object.values(workouts);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Fichas de Musculação' }} />
            <FlatList
                data={workoutsList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 15 }}
                renderItem={({ item }: { item: Workout }) => (
                    <Link 
                        href={{
                          pathname: "/fichas/[id]",
                          params: { id: item.id, title: item.name }
                        }} 
                        asChild
                    >
                        <Pressable style={styles.card}>
                            <View>
                                <Text style={styles.cardTitle}>{item.name} {'->'}</Text>
                                <Text style={styles.exerciseCount}>{item.exercises.length} exercícios</Text>
                            </View>
                            <Text style={styles.muscleGroups}>{item.groups}</Text>
                        </Pressable>
                    </Link>
                )}
                // O gráfico é adicionado aqui como o rodapé da lista
                ListFooterComponent={<WorkoutTypeSummary history={history} workouts={workouts} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', paddingHorizontal: 15 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 },
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    exerciseCount: { fontSize: 14, color: 'gray', marginTop: 5 },
    muscleGroups: { fontSize: 14, color: '#555', marginTop: 10, alignSelf: 'flex-end', fontWeight: '500' },
    summaryContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginTop: 15,
        marginBottom: 15,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    barGraphContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 120,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 5,
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
    }
});

