// app/exercicio-modal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkouts } from '../hooks/useWorkouts';
import { Exercise } from '../constants/workoutData';

const themeColor = '#5a4fcf';

export default function ExerciseModal() {
    const { workoutId, exerciseId } = useLocalSearchParams<{ workoutId: string, exerciseId?: string }>();
    const { workouts, addExercise, updateExercise } = useWorkouts();
    const router = useRouter();

    const [name, setName] = useState('');
    const [series, setSeries] = useState('');
    const [reps, setReps] = useState('');
    const [muscle, setMuscle] = useState('');
    const [obs, setObs] = useState('');
    const [gifUrl, setGifUrl] = useState('');

    const isEditing = !!exerciseId;

    useEffect(() => {
        if (isEditing && workoutId) {
            const exerciseToEdit = workouts[workoutId]?.exercises.find(ex => ex.id === exerciseId);
            if (exerciseToEdit) {
                setName(exerciseToEdit.name);
                setSeries(exerciseToEdit.series.toString());
                setReps(exerciseToEdit.reps);
                setMuscle(exerciseToEdit.muscle);
                setObs(exerciseToEdit.obs);
                setGifUrl(exerciseToEdit.gifUrl);
            }
        }
    }, [exerciseId, workouts, workoutId, isEditing]);

    const handleSave = async () => {
        if (!workoutId || !name || !series || !reps || !muscle) {
            Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        const exerciseData = {
            name,
            series: parseInt(series, 10) || 0,
            reps,
            muscle,
            obs,
            gifUrl,
        };

        if (isEditing) {
            await updateExercise(workoutId, { ...exerciseData, id: exerciseId });
        } else {
            const newExercise: Exercise = { ...exerciseData, id: `ex_${Date.now()}` };
            await addExercise(workoutId, newExercise);
        }

        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: isEditing ? 'Editar Exercício' : 'Novo Exercício' }} />
            <Text style={styles.label}>Nome do Exercício*</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Músculo*</Text>
            <TextInput style={styles.input} value={muscle} onChangeText={setMuscle} />
            
            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.label}>Séries*</Text>
                    <TextInput style={styles.input} value={series} onChangeText={setSeries} keyboardType="numeric" />
                </View>
                <View style={{...styles.column, marginRight: 0}}>
                    <Text style={styles.label}>Repetições*</Text>
                    <TextInput style={styles.input} value={reps} onChangeText={setReps} />
                </View>
            </View>

            <Text style={styles.label}>Observações</Text>
            <TextInput style={styles.input} value={obs} onChangeText={setObs} />

            <Text style={styles.label}>URL do GIF (opcional)</Text>
            <TextInput style={styles.input} value={gifUrl} onChangeText={setGifUrl} placeholder="Cole o link do GIF aqui" />

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
    label: { fontSize: 16, marginBottom: 5, color: 'gray' },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    column: { flex: 1, marginRight: 10 },
    saveButton: { backgroundColor: themeColor, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

