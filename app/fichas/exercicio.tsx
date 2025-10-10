// app/fichas/exercicio.tsx

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native'; // NOVO: Importa Dimensions
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useWorkouts } from '../../hooks/useWorkouts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit'; // NOVO: Importa LineChart

const themeColor = '#5a4fcf';
const screenWidth = Dimensions.get("window").width; // Obtém a largura do ecrã

// ⚠️ NOVO GRÁFICO DE LINHAS ⚠️
const EvolutionChart = ({ data }: { data: { labels: string[], values: number[] } | null }) => {
    if (!data || data.values.length === 0) {
        return <Text style={styles.noDataText}>Registe o peso para ver o gráfico de evolução.</Text>;
    }

    // Estrutura de dados exigida pelo react-native-chart-kit
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                data: data.values,
                color: (opacity = 1) => `rgba(90, 79, 207, ${opacity})`, // themeColor em RGB
                strokeWidth: 3,
            }
        ]
    };

    return (
        <View style={styles.chartContainer}>
            <LineChart
                data={chartData}
                width={screenWidth - 80} // Largura do ecrã menos o padding do container (20*2 + margens)
                height={220}
                yAxisSuffix="kg"
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "5",
                        strokeWidth: "2",
                        stroke: themeColor
                    }
                }}
                bezier // Curvas suaves
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
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
}

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
    // NOVO: Estilos para o LineChart (Ocupa o lugar dos antigos estilos de barras)
    chartContainer: {
        alignItems: 'center',
        paddingHorizontal: 5, 
    },
});