// app/logEsporte.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ALTERADO: Importa também os valores padrão
import { MET_DATA, DEFAULT_MET_VALUES } from '../constants/metData';
import Toast from 'react-native-toast-message';

const themeColor = '#5a4fcf';
const PROFILE_KEY = 'userProfile';

const SWIMMING_MET_VALUE = 7.0;

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LogSportScreen() {
    const { esporte, date: dateParam } = useLocalSearchParams<{ esporte: string, date?: string }>();
    const router = useRouter();

    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState<'Leve' | 'Moderada' | 'Alta' | null>(null);
    const [notes, setNotes] = useState('');
    const [userWeight, setUserWeight] = useState(0);
    const [estimatedCalories, setEstimatedCalories] = useState(0);
    const [distance, setDistance] = useState('');
    const [yards, setYards] = useState('');

    const isSwimming = esporte?.toLowerCase() === 'natação';
    const isAmericanFootball = esporte?.toLowerCase() === 'futebol americano';

    useFocusEffect(
        React.useCallback(() => {
            const loadProfile = async () => {
                const profileJSON = await AsyncStorage.getItem(PROFILE_KEY);
                if (profileJSON) {
                    const { weight } = JSON.parse(profileJSON);
                    setUserWeight(weight || 0);
                }
            };
            loadProfile();
        }, [])
    );

    useEffect(() => {
        const durationNum = parseInt(duration, 10) || 0;
        const weightNum = userWeight || 0;
        
        let calories = 0;

        if (weightNum > 0 && durationNum > 0) {
            if (isSwimming) {
                const durationInHours = durationNum / 60;
                calories = SWIMMING_MET_VALUE * weightNum * durationInHours;
            } else {
                if (intensity) {
                    // ALTERADO: Lógica de Fallback
                    // 1. Tenta encontrar os valores MET para o desporto específico.
                    // 2. Se não encontrar, usa os valores MET padrão.
                    const sportMetValues = MET_DATA[esporte] || DEFAULT_MET_VALUES;
                    const metValue = sportMetValues[intensity] || 0;
                    
                    if (metValue > 0) {
                        calories = (metValue * weightNum * 3.5) / 200 * durationNum;
                    }
                }
            }
        }
        
        setEstimatedCalories(Math.round(calories));
        
    }, [duration, intensity, userWeight, esporte]);

    const handleSaveActivity = async () => {
        const commonFieldsMissing = !duration;
        const sportSpecificFieldsMissing = !isSwimming && !intensity;

        if (commonFieldsMissing || sportSpecificFieldsMissing) {
            let message = 'Por favor, preencha a Duração e a Intensidade.';
            if (isSwimming) message = 'Por favor, preencha a Duração.';
            Toast.show({ type: 'error', text1: 'Campos Incompletos', text2: message });
            return;
        }

        try {
            const details: any = {
                duration: parseInt(duration, 10),
                notes,
                calories: estimatedCalories,
            };

            if (!isSwimming) {
                details.intensity = intensity;
            }
            if (isSwimming && distance) {
                details.distance = parseInt(distance, 10);
            }
            if (isAmericanFootball && yards) {
                details.yards = parseInt(yards, 10) || 0;
            }

            const newActivity = {
                id: `activity_${Date.now()}_${Math.random()}`,
                date: dateParam || getLocalDateString(),
                category: esporte,
                details,
            };

            const historyJSON = await AsyncStorage.getItem('workoutHistory');
            let history = historyJSON ? JSON.parse(historyJSON) : [];
            history.push(newActivity);
            await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));

            Toast.show({ type: 'success', text1: 'Sucesso!', text2: `${esporte} registado com sucesso.` });
            router.back();

        } catch (e) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível registar a atividade.' });
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
                    placeholder="Ex: 60"
                />

                {isSwimming && (
                    <>
                        <Text style={styles.label}>Metros Nadados (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={distance}
                            onChangeText={setDistance}
                            placeholder="Ex: 1500 (métrica de performance)"
                        />
                    </>
                )}

                {isAmericanFootball && (
                    <>
                        <Text style={styles.label}>Jardas Percorridas</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={yards}
                            onChangeText={setYards}
                            placeholder="Ex: 80"
                        />
                    </>
                )}

                {!isSwimming && (
                    <>
                        <Text style={styles.label}>Intensidade</Text>
                        <View style={styles.intensityContainer}>
                            {['Leve', 'Moderada', 'Alta'].map((level) => (
                                <Pressable 
                                    key={level}
                                    style={[ styles.intensityButton, intensity === level && styles.intensitySelected ]}
                                    onPress={() => setIntensity(level as any)}
                                >
                                    <Text style={[ styles.intensityText, intensity === level && styles.intensityTextSelected ]}>{level}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </>
                )}

                {estimatedCalories > 0 && (
                    <View style={styles.caloriesContainer}>
                        <Text style={styles.caloriesLabel}>Gasto Calórico Estimado:</Text>
                        <Text style={styles.caloriesValue}>{estimatedCalories} kcal</Text>
                    </View>
                )}

                <Text style={styles.label}>Notas (opcional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={
                        isSwimming ? "Ex: Treino de crawl, piscina de 25m..." :
                        isAmericanFootball ? "Ex: Treino de passes, jogo amigável..." :
                        "Ex: Jogo amigável, treino de ataque..."
                    }
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
    intensityText: { fontSize: 15, color: '#333' },
    intensityTextSelected: { color: 'white', fontWeight: 'bold' },
    saveButton: { backgroundColor: themeColor, padding: 20, borderRadius: 15, alignItems: 'center' },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    caloriesContainer: {
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    caloriesLabel: {
        fontSize: 14,
        color: 'gray',
    },
    caloriesValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: themeColor,
        marginTop: 5,
    },
});