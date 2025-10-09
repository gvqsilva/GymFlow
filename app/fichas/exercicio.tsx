// app/fichas/exercicio.tsx

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useWorkouts } from '../../hooks/useWorkouts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const themeColor = '#5a4fcf';

// Gráfico de barras simples e robusto
const EvolutionChart = ({ data }: { data: { labels: string[], values: number[] } | null }) => {
    if (!data || data.values.length === 0) {
        return <Text style={styles.noDataText}>Registe o peso para ver o gráfico de evolução.</Text>;
    }

    const maxValue = Math.max(...data.values, 1);

    return (
        <View style={styles.chartBody}>
            {data.values.map((value, index) => (
                <View key={index} style={styles.barWrapper}>
                    <View style={styles.barItem}>
                        <Text style={styles.barValue}>{value}kg</Text>
                        <View style={[styles.bar, { height: `${(value / maxValue) * 100}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{data.labels[index]}</Text>
                </View>
            ))}
        </View>
    );
};


export default function ExerciseDetailScreen() {
    const { workoutId, exerciseId } = useLocalSearchParams<{ workoutId: string, exerciseId: string }>();
    const { workouts } = useWorkouts();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useFocusEffect(
        useCallback(() => {
            const loadHistory = async () => {
                setIsLoading(true);
                const historyJSON = await AsyncStorage.getItem('workoutHistory');
                setHistory(historyJSON ? JSON.parse(historyJSON) : []);
                setIsLoading(false);
            };
            loadHistory();
        }, [])
    );
    
    const exercise = workoutId && exerciseId ? workouts[workoutId]?.exercises.find(ex => ex.id === exerciseId) : undefined;

    // Processa o histórico para criar os dados do gráfico
    const chartData = useMemo(() => {
        if (!exerciseId || history.length === 0) return null;

        const exerciseHistory = history
            .filter(entry => 
                entry.category === 'Musculação' && 
                entry.details?.performance &&
                entry.details.performance[exerciseId]
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-5); // Limita o gráfico aos últimos 5 registos

        if (exerciseHistory.length === 0) return null;

        return {
            labels: exerciseHistory.map(entry => {
                const date = new Date(entry.date);
                const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
                return `${adjustedDate.getDate()}/${adjustedDate.getMonth() + 1}`;
            }),
            values: exerciseHistory.map(entry => entry.details.performance[exerciseId]),
        };
    }, [history, exerciseId]);
    
    // Calcula o Recorde Pessoal (PR)
    const personalRecord = useMemo(() => {
        if (!exerciseId || history.length === 0) return null;
        const weights = history
            .filter(entry => entry.category === 'Musculação' && entry.details?.performance?.[exerciseId])
            .map(entry => entry.details.performance[exerciseId]);
        
        return weights.length > 0 ? Math.max(...weights) : null;
    }, [history, exerciseId]);

    if (!exercise) {
        return <View style={styles.container}><Text>Exercício não encontrado!</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Stack.Screen options={{ title: exercise.name }} />
                <View style={styles.header}>
                     <Text style={styles.headerText}>Músculo: {exercise.muscle} </Text>
                     <View style={styles.detailsRow}>
                        <Text style={styles.headerText}>Série: {exercise.series} </Text>
                        <Text style={styles.headerText}>Reps: {exercise.reps} </Text>
                     </View>
                     {exercise.obs ? <Text style={styles.headerText}>Obs: {exercise.obs}</Text> : null}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Vídeo Explicativo </Text>
                    <View style={styles.imageWrapper}>
                        {exercise.gifUrl ? (
                            <Image source={{ uri: exercise.gifUrl }} style={styles.gif} resizeMode="contain" />
                        ) : (
                            <Text style={styles.noDataText}>Nenhum GIF disponível </Text>
                        )}
                    </View>
                </View>
                
                <View style={[styles.sectionContainer, { marginTop: 0 }]}>
                    <Text style={styles.sectionTitle}>Evolução de Carga</Text>
                    {isLoading ? <ActivityIndicator color={themeColor} /> : (
                        <>
                            <EvolutionChart data={chartData} />
                            {personalRecord && (
                                <Text style={styles.prText}>Recorde Pessoal (PR): {personalRecord} kg</Text>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: themeColor, padding: 20 },
    headerText: { color: 'white', fontSize: 16, marginBottom: 5 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    sectionContainer: { 
        margin: 20, 
        padding: 20, 
        backgroundColor: 'white', 
        borderRadius: 15, 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 20, 
        textAlign: 'center',
    },
    imageWrapper: { 
        width: '100%', 
        aspectRatio: 1, 
        backgroundColor: '#e9e9e9', 
        borderRadius: 10, 
        overflow: 'hidden', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    gif: { width: '100%', height: '100%' },
    noDataText: { color: 'gray', fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
    prText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: themeColor, textAlign: 'center' },
    // Estilos para o gráfico
    chartBody: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        width: '100%',
        // A linha foi removida daqui
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    barItem: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    barValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    bar: {
        width: '80%',
        backgroundColor: themeColor,
        borderRadius: 4,
    },
    barLabel: {
        fontSize: 12,
        color: 'gray',
        marginTop: 6,
    },
});

