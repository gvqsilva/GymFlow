// app/editar-ficha/[id].tsx

import React from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '../../hooks/useWorkouts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Exercise } from '../../constants/workoutData';

const themeColor = '#5a4fcf';

export default function EditWorkoutScreen() {
    const { id, title } = useLocalSearchParams<{ id: string, title: string }>();
    const { workouts, deleteExercise, reorderExercises, refreshWorkouts } = useWorkouts();
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            refreshWorkouts();
        }, [])
    );
    
    const workout = id ? workouts[id] : null;

    const handleDelete = (exerciseId: string, exerciseName: string) => {
        if (!id) return;
        Alert.alert(
            `Apagar "${exerciseName}"?`,
            "Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: () => deleteExercise(id, exerciseId) }
            ]
        )
    };

    if (!workout) {
        return <Text>Ficha não encontrada.</Text>
    }

    const renderItem = ({ item, drag, isActive }: RenderItemParams<Exercise>) => {
        return (
            <ScaleDecorator>
                <Pressable 
                    onLongPress={drag} 
                    disabled={isActive}
                    style={[styles.exerciseCard, { backgroundColor: isActive ? '#e9e9e9' : 'white' }]}
                >
                    <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <Text style={styles.exerciseDetails}>{item.series} séries x {item.reps} reps</Text>
                    </View>
                    <View style={styles.actions}>
                        <Pressable onPress={() => router.push({ pathname: '/exercicio-modal', params: { workoutId: id, exerciseId: item.id } })}>
                            <Ionicons name="pencil" size={24} color={themeColor} />
                        </Pressable>
                         <Pressable style={{ marginLeft: 20 }} onPress={() => handleDelete(item.id, item.name)}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </Pressable>
                    </View>
                     <Pressable onLongPress={drag} disabled={isActive} style={{ marginLeft: 15, padding: 5 }}>
                        <Ionicons name="menu" size={28} color="#ccc" />
                    </Pressable>
                </Pressable>
            </ScaleDecorator>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Stack.Screen options={{ title: title || 'Editar Ficha' }} />
                <DraggableFlatList
                    data={workout.exercises}
                    onDragEnd={({ data }) => id && reorderExercises(id, data)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    containerStyle={{ padding: 15 }}
                />
                <Pressable style={styles.addButton} onPress={() => router.push({ pathname: '/exercicio-modal', params: { workoutId: id } })}>
                    <Ionicons name="add" size={32} color="white" />
                    <Text style={styles.addButtonText}>Adicionar Exercício </Text>
                </Pressable>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    exerciseCard: { paddingVertical: 15, paddingLeft: 15, paddingRight: 5, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 18, fontWeight: 'bold' },
    exerciseDetails: { fontSize: 14, color: 'gray', marginTop: 4 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    addButton: { backgroundColor: themeColor, margin: 15, padding: 15, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

