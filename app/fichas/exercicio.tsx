// app/fichas/exercicio.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useWorkouts } from '../../hooks/useWorkouts'; // Importa o hook

const themeColor = '#5a4fcf';

export default function ExerciseDetailScreen() {
    const { workoutId, exerciseId } = useLocalSearchParams<{ workoutId: string, exerciseId: string }>();
    const { workouts } = useWorkouts(); // Usa o hook para obter os dados dinâmicos
    
    // Procura o exercício nos dados dinâmicos
    const exercise = workoutId && exerciseId ? workouts[workoutId]?.exercises.find(ex => ex.id === exerciseId) : undefined;

    if (!exercise) {
        return <View style={styles.container}><Text>Exercício não encontrado!</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: exercise.name }} />
            <View style={styles.header}>
                 <Text style={styles.headerText}>Músculo: {exercise.muscle} </Text>
                 <View style={styles.detailsRow}>
                    <Text style={styles.headerText}>Série: {exercise.series} </Text>
                    <Text style={styles.headerText}>Reps: {exercise.reps} </Text>
                 </View>
                 {exercise.obs ? <Text style={styles.headerText}>Obs: {exercise.obs} </Text> : null}
            </View>

            <View style={styles.videoContainer}>
                <Text style={styles.videoTitle}>Vídeo Explicativo</Text>
                <View style={styles.imageWrapper}>
                    {exercise.gifUrl ? (
                        <Image source={{ uri: exercise.gifUrl }} style={styles.gif} resizeMode="contain" />
                    ) : (
                        <Text style={styles.noGifText}>Nenhum GIF disponível</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: themeColor, padding: 20, },
    headerText: { color: 'white', fontSize: 16, marginBottom: 5, },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    videoContainer: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 15, alignItems: 'center', elevation: 3, },
    videoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333', },
    imageWrapper: { width: '100%', aspectRatio: 1, backgroundColor: '#e9e9e9', borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    gif: { width: '100%', height: '100%', },
    noGifText: { color: 'gray', fontStyle: 'italic' },
});

