// app/logEsporte.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themeColor = '#5a4fcf';

// Helper para obter a data local no formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LogSportScreen() {
    const { esporte } = useLocalSearchParams<{ esporte: string }>();
    const router = useRouter();

    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState<'Leve' | 'Moderada' | 'Alta' | null>(null);
    const [notes, setNotes] = useState('');

    const handleSaveActivity = async () => {
        if (!duration || !intensity) {
            Alert.alert("Campos Obrigatórios", "Por favor, preencha a duração e a intensidade.");
            return;
        }

        try {
            const newActivity = {
                date: getLocalDateString(),
                category: esporte, // Ex: 'Futebol Society'
                details: {
                    duration: parseInt(duration, 10),
                    intensity,
                    notes,
                }
            };

            const historyJSON = await AsyncStorage.getItem('workoutHistory');
            let history = historyJSON ? JSON.parse(historyJSON) : [];
            history.push(newActivity); // Adiciona a nova atividade ao histórico existente
            await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));

            Alert.alert("Sucesso!", `${esporte} registado com sucesso.`);
            router.back();

        } catch (e) {
            Alert.alert("Erro", "Não foi possível registar a atividade.");
            console.error("Failed to save activity", e);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: esporte }} />
            
            <View style={styles.card}>
                <Text style={styles.label}>Duração (minutos)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="Ex: 90"
                />

                <Text style={styles.label}>Intensidade</Text>
                <View style={styles.intensityContainer}>
                    {['Leve', 'Moderada', 'Alta'].map((level) => (
                        <Pressable 
                            key={level}
                            style={[
                                styles.intensityButton, 
                                intensity === level && styles.intensitySelected
                            ]}
                            onPress={() => setIntensity(level as any)}
                        >
                            <Text style={[
                                styles.intensityText,
                                intensity === level && styles.intensityTextSelected
                            ]}>{level}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Notas (opcional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Ex: Jogo amigável, treino de ataque..."
                    multiline
                />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveActivity}>
                <Text style={styles.saveButtonText}>Registar Atividade</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20 },
    label: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
    input: { backgroundColor: '#f0f2f5', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 20 },
    textArea: { height: 100, textAlignVertical: 'top' },
    intensityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    intensityButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginHorizontal: 5 },
    intensitySelected: { backgroundColor: themeColor, borderColor: themeColor },
    intensityText: { fontSize: 16, color: '#333' },
    intensityTextSelected: { color: 'white', fontWeight: 'bold' },
    saveButton: { backgroundColor: themeColor, padding: 20, borderRadius: 15, alignItems: 'center' },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

