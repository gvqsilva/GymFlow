// app/fichas/[id].tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, Link, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORKOUT_DATA } from '../../constants/workoutData';
import * as Haptics from 'expo-haptics'; // Importa o módulo de vibração

const themeColor = '#5a4fcf';

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const workout = id ? WORKOUT_DATA[id] : undefined;

    const handleLogWorkout = async () => {
        if (!id) {
            Alert.alert("Erro", "Não foi possível identificar o treino.");
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const workoutEntry = { date: today, type: id };

            const historyJSON = await AsyncStorage.getItem('workoutHistory');
            let history: any[] = historyJSON ? JSON.parse(historyJSON) : [];
            
            if (history.length > 0 && typeof history[0] === 'string') {
                history = history.map(dateString => ({ date: dateString, type: 'A' })); 
            }

            const todayLogIndex = history.findIndex((entry: {date: string}) => entry.date === today);

            const saveWorkout = async (isUpdate: boolean) => {
                // LÓGICA PRINCIPAL: Define o próximo treino na sequência
                let nextWorkoutId = 'A';
                if (id === 'A') nextWorkoutId = 'B';
                if (id === 'B') nextWorkoutId = 'C';
                if (id === 'C') nextWorkoutId = 'A';

                // Salva o próximo treino na memória para a Tela Home usar
                await AsyncStorage.setItem('nextWorkoutId', nextWorkoutId);

                // Salva o histórico do treino atual
                if (isUpdate) {
                    history[todayLogIndex] = workoutEntry;
                } else {
                    history.push(workoutEntry);
                }
                await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // VIBRAÇÃO DE SUCESSO

                const messageAction = isUpdate ? "atualizado para" : "contabilizado como";
                Alert.alert("Sucesso!", `Treino de hoje ${messageAction} ${id}.`);
            };

            if (todayLogIndex === -1) {
                await saveWorkout(false); // Salva como novo treino
            } else {
                const loggedWorkout = history[todayLogIndex];
                if (loggedWorkout.type === id) {
                    Alert.alert("Aviso", `O treino ${id} já foi contabilizado hoje.`);
                } else {
                    Alert.alert(
                        "Substituir Treino?",
                        `Você já contabilizou o Treino ${loggedWorkout.type} hoje. Deseja substituí-lo pelo Treino ${id}?`,
                        [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Sim, Substituir", style: "default", onPress: () => saveWorkout(true) } // Atualiza o treino existente
                        ]
                    );
                }
            }
        } catch (e) {
            console.error("Failed to log workout.", e);
            Alert.alert("Erro de Dados", "Ocorreu um erro ao ler o seu histórico.");
        }
    };

    const handleClearHistory = () => {
        Alert.alert(
            "Limpar Histórico de Treinos",
            "Você tem certeza que deseja apagar todo o seu histórico?",
            [
                { text: "Cancelar" },
                { 
                    text: "Sim, Apagar", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            // Limpa tanto o histórico quanto a sequência de treinos
                            await AsyncStorage.multiRemove(['workoutHistory', 'nextWorkoutId']);
                            Alert.alert("Sucesso", "Seu histórico e a sequência de treinos foram reiniciados.");
                        } catch (e) {
                            Alert.alert("Erro", "Não foi possível apagar o histórico.");
                        }
                    }
                }
            ]
        );
    };

    if (!workout) { return null; }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: `Treino ${workout.id}` }} />
             <View style={styles.header}>
                <Text style={styles.headerText}>{workout.groups}</Text>
            </View>
            <Pressable 
                style={styles.logButton} 
                onPress={handleLogWorkout}
                onLongPress={handleClearHistory}
            >
                <Text style={styles.logButtonText}>Contabilizar Treino</Text>
            </Pressable>
            <FlatList
                data={workout.exercises}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 15 }}
                renderItem={({ item }) => (
                    <Link href={{ pathname: '/fichas/exercicio', params: { workoutId: id, exerciseId: item.id } }} asChild>
                        <Pressable style={styles.card}>
                            <View style={{flex: 1}}>
                                <Text style={styles.exerciseName}>{item.name}</Text>
                                <Text style={styles.muscleTag}>{item.muscle}</Text>
                                {item.obs ? <Text style={styles.obsText}>Obs: {item.obs} </Text> : null}
                            </View>
                            <View style={styles.seriesReps}>
                                <Text style={styles.seriesRepsText}>Série: {item.series} </Text>
                                <Text style={styles.seriesRepsText}>Reps: {item.reps} </Text>
                            </View>
                        </Pressable>
                    </Link>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { padding: 15, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'},
    headerText: { fontSize: 16, color: 'gray', fontWeight: '500'},
    logButton: { backgroundColor: themeColor, margin: 15, padding: 15, borderRadius: 15, alignItems: 'center' },
    logButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    card: { backgroundColor: 'white', borderRadius: 15, paddingVertical: 20, paddingHorizontal: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, minHeight: 100 },
    exerciseName: { fontSize: 18, fontWeight: 'bold', color: '#333', flexShrink: 1 },
    muscleTag: { backgroundColor: '#e0e0e0', color: '#555', alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden', marginTop: 5, fontSize: 12 },
    obsText: { fontSize: 12, color: 'gray', marginTop: 5, fontStyle: 'italic' },
    seriesReps: { alignItems: 'flex-end', marginLeft: 10 },
    seriesRepsText: { fontSize: 14, color: '#333' },
});