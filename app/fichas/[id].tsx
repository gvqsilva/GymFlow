// app/fichas/[id].tsx

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Link, Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkouts } from '../../hooks/useWorkouts';
import * as Haptics from 'expo-haptics';
import { MET_DATA } from '../../constants/metData';

const themeColor = '#5a4fcf';
const PROFILE_KEY = 'userProfile';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function WorkoutDetailScreen() {
    const { id, title } = useLocalSearchParams<{ id: string, title?: string }>();
    const { workouts, refreshWorkouts } = useWorkouts();
    const [userWeight, setUserWeight] = useState(0);
    const [performance, setPerformance] = useState<{ [key: string]: string }>({});

    useFocusEffect(
        React.useCallback(() => {
            refreshWorkouts();
            const loadProfile = async () => {
                const profileJSON = await AsyncStorage.getItem(PROFILE_KEY);
                if (profileJSON) {
                    const { weight } = JSON.parse(profileJSON);
                    setUserWeight(weight || 0);
                }
            };
            loadProfile();
        }, [refreshWorkouts])
    );

    const workout = id ? workouts[id] : undefined;

    const handleWeightChange = (exerciseId: string, weight: string) => {
        setPerformance(prev => ({ ...prev, [exerciseId]: weight }));
    };

    const handleLogWorkout = async () => {
        if (!id || !workout) {
            Alert.alert("Erro", "Não foi possível identificar o treino.");
            return;
        }

        const duration = 60;
        const intensity = 'Moderada';
        const metValue = MET_DATA['Musculação']?.[intensity] || 0;
        const calories = userWeight > 0 ? (metValue * userWeight * 3.5) / 200 * duration : 0;
        
        const performanceData: { [key: string]: number } = {};
        Object.entries(performance).forEach(([exerciseId, weight]) => {
            const weightNum = parseFloat(weight.replace(',', '.'));
            if (!isNaN(weightNum) && weightNum > 0) {
                performanceData[exerciseId] = weightNum;
            }
        });

        try {
            const today = getLocalDateString();
            const workoutEntry = { 
                id: `activity_${Date.now()}_${Math.random()}`,
                date: today, 
                category: 'Musculação', 
                details: { 
                    type: id,
                    calories: Math.round(calories),
                    performance: performanceData,
                } 
            };

            const historyJSON = await AsyncStorage.getItem('workoutHistory');
            let history: any[] = historyJSON ? JSON.parse(historyJSON) : [];

            const todayMusculacaoLogIndex = history.findIndex(
                (entry: { date: string, category: string }) => entry.date === today && entry.category === 'Musculação'
            );

            const saveWorkout = async (isUpdate: boolean) => {
                const workoutIds = Object.keys(workouts);
                const currentIndex = workoutIds.indexOf(id);
                const nextIndex = (currentIndex + 1) % workoutIds.length;
                const nextWorkoutId = workoutIds[nextIndex];

                await AsyncStorage.setItem('nextWorkoutId', nextWorkoutId);

                if (isUpdate) {
                    workoutEntry.id = history[todayMusculacaoLogIndex].id;
                    history[todayMusculacaoLogIndex] = workoutEntry;
                } else {
                    history.push(workoutEntry);
                }
                await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                const messageAction = isUpdate ? "atualizado para" : "contabilizado como";
                Alert.alert("Sucesso!", `Treino de hoje ${messageAction} ${workout.name}.`);
            };

            if (todayMusculacaoLogIndex === -1) {
                await saveWorkout(false);
            } else {
                const loggedWorkout = history[todayMusculacaoLogIndex];
                if (loggedWorkout.details.type === id && Object.keys(performanceData).length === 0) {
                     Alert.alert("Aviso", `O treino de musculação ${workout.name} já foi contabilizado hoje.`);
                     return;
                }
                Alert.alert(
                    "Substituir Registo?",
                    `Você já contabilizou um treino de musculação hoje. Deseja substituí-lo por este?`,
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Sim, Substituir", style: "default", onPress: () => saveWorkout(true) }
                    ]
                );
            }
        } catch (e) {
            console.error("Failed to log workout.", e);
            Alert.alert("Erro de Dados", "Ocorreu um erro ao ler o seu histórico.");
        }
    };

    if (!workout) { 
        return <View style={styles.container}><Text>A carregar ficha...</Text></View>; 
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: title || workout.name }} />
             <View style={styles.header}>
                <Text style={styles.headerText}>{workout.groups}</Text>
            </View>
            
            <FlatList
                data={workout.exercises}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 15 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Link href={{ pathname: '/fichas/exercicio', params: { workoutId: id, exerciseId: item.id } }} asChild>
                            <Pressable style={styles.mainInfo}>
                                <Text style={styles.exerciseName}>{item.name} </Text>
                                <Text style={styles.muscleTag}>{item.muscle} </Text>
                                {/* OBSERVAÇÕES ADICIONADAS DE VOLTA AQUI */}
                                {item.obs ? <Text style={styles.obsText}>Obs: {item.obs}</Text> : null}
                                <View style={styles.seriesRepsContainer}>
                                    <Text style={styles.seriesRepsText}>Série: {item.series} </Text>
                                    <Text style={styles.seriesRepsText}>Reps: {item.reps} </Text>
                                </View>
                            </Pressable>
                        </Link>
                        <View style={styles.prSection}>
                            <Text style={styles.prLabel}>PR:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={performance[item.id] || ''}
                                onChangeText={(text) => handleWeightChange(item.id, text)}
                            />
                            <Text style={styles.unitText}>kg </Text>
                        </View>
                    </View>
                )}
                ListFooterComponent={
                    <Pressable style={styles.logButton} onPress={handleLogWorkout}>
                        <Text style={styles.logButtonText}>Contabilizar Treino </Text>
                    </Pressable>
                }
                ListFooterComponentStyle={{ paddingBottom: 30 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { padding: 15, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'},
    headerText: { fontSize: 16, color: 'gray', fontWeight: '500'},
    logButton: { backgroundColor: themeColor, marginHorizontal: 15, marginTop: 20, padding: 15, borderRadius: 15, alignItems: 'center' },
    logButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 15, 
        marginBottom: 15, 
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    mainInfo: {
        padding: 20,
    },
    exerciseName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    muscleTag: { backgroundColor: '#e0e0e0', color: '#555', alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden', fontSize: 12 },
    obsText: { // NOVO ESTILO PARA AS OBSERVAÇÕES
        fontSize: 12, 
        color: 'gray', 
        marginTop: 10, 
        fontStyle: 'italic' 
    },
    seriesRepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    seriesRepsText: {
        fontSize: 14,
        color: '#555',
    },
    prSection: {
        backgroundColor: '#444',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#555',
    },
    prLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    input: {
        backgroundColor: '#555',
        color: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 18,
        width: 80,
        textAlign: 'center',
        marginLeft: 10,
    },
    unitText: {
        fontSize: 16,
        color: '#ccc',
        marginLeft: 8,
    }
});

