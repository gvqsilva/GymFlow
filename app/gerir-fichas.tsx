// app/gerir-fichas.tsx

import React from 'react';
import { View, StyleSheet, FlatList, Pressable, Text, ActivityIndicator, Alert } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useWorkouts } from '../hooks/useWorkouts';
import { Workout } from '../constants/workoutData';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

export default function ManageWorkoutsScreen() {
    const { workouts, isLoading, refreshWorkouts, deleteWorkout } = useWorkouts();
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            refreshWorkouts();
        }, [])
    );

    const handleDeleteWorkout = (workoutId: string, workoutName: string) => {
        Alert.alert(
            `Apagar Ficha "${workoutName}"?`,
            "Todos os exercícios desta ficha serão apagados. Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: () => deleteWorkout(workoutId) }
            ]
        );
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColor} style={{ flex: 1 }} />;
    }

    const workoutsList = Object.values(workouts);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Gerir Fichas' }} />
            <FlatList
                data={workoutsList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item }: { item: Workout }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push({
                            pathname: "/editar-ficha/[id]",
                            params: { id: item.id, title: item.name }
                        })}
                    >
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>{item.exercises.length} exercícios</Text>
                        </View>
                        <Pressable onPress={() => handleDeleteWorkout(item.id, item.name)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </Pressable>
                    </Pressable>
                )}
            />
            <Pressable style={styles.addButton} onPress={() => router.push('/ficha-modal')}>
                <Ionicons name="add" size={32} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 14, color: 'gray', marginTop: 5 },
    deleteButton: {
        padding: 10,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: themeColor,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
});

