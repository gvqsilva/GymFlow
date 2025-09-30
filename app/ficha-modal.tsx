// app/ficha-modal.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useWorkouts } from '../hooks/useWorkouts';

const themeColor = '#5a4fcf';

export default function FichaModal() {
    const { addWorkout } = useWorkouts();
    const router = useRouter();

    const [name, setName] = useState('');
    const [groups, setGroups] = useState('');

    const handleSave = async () => {
        if (!name || !groups) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }

        await addWorkout(name, groups);
        router.back();
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Nova Ficha de Treino' }} />
            <Text style={styles.label}>Nome da Ficha</Text>
            <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Ex: Treino D"
            />

            <Text style={styles.label}>Grupos Musculares</Text>
            <TextInput 
                style={styles.input} 
                value={groups} 
                onChangeText={setGroups} 
                placeholder="Ex: Cardio e Abdômen"
            />

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Ficha</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
    label: { fontSize: 16, marginBottom: 5, color: 'gray' },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    saveButton: { backgroundColor: themeColor, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
