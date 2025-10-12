// app/perfil.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { calculateTDEE, BMRInput } from '../utils/calorieCalculator';

const themeColor = '#5a4fcf';

// --- Funções Auxiliares ---
const getLocalDateString = (date = new Date()) => date.toISOString().split('T')[0];

const calculateAge = (birthDate: string | Date): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age > 0 ? age : 0;
};

const getBmiClassification = (imc: number) => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: '#3498db' };
    if (imc < 25) return { text: 'Peso ideal', color: '#2ecc71' };
    if (imc < 30) return { text: 'Sobrepeso', color: '#f39c12' };
    return { text: 'Obesidade', color: '#e74c3c' };
};

const calculateIMC = (weight: number, height: number) => {
    if (weight > 0 && height > 0) {
        const heightInMeters = height / 100;
        const imc = weight / (heightInMeters * heightInMeters);
        const classification = getBmiClassification(imc);
        return {
            value: imc.toFixed(1),
            text: classification.text,
            color: classification.color,
        };
    }
    return { value: 'N/A', text: '', color: 'gray' };
};
// --- Fim das Funções Auxiliares ---

export default function ProfileScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [dailyConsumed, setDailyConsumed] = useState(0);
    const [dailySpent, setDailySpent] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [calorieGoal, setCalorieGoal] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const profileJSON = await AsyncStorage.getItem('userProfile');
                    const loadedProfile = profileJSON ? JSON.parse(profileJSON) : null;
                    setProfile(loadedProfile);

                    const today = getLocalDateString();
                    
                    const foodHistoryJSON = await AsyncStorage.getItem('foodHistory');
                    const foodHistory = foodHistoryJSON ? JSON.parse(foodHistoryJSON) : [];
                    const consumed = foodHistory
                        .filter((entry: any) => entry.date === today)
                        .reduce((sum: number, entry: any) => sum + (entry.data?.calories || 0), 0);
                    setDailyConsumed(Math.round(consumed));
                    
                    const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
                    const workoutHistory = workoutHistoryJSON ? JSON.parse(workoutHistoryJSON) : [];
                    const spent = workoutHistory
                        .filter((entry: any) => entry.date === today)
                        .reduce((sum: number, entry: any) => sum + (entry.details?.calories || 0), 0);
                    setDailySpent(Math.round(spent));

                    if (loadedProfile) {
                        const age = calculateAge(loadedProfile.birthDate);
                        const weightNum = parseFloat(loadedProfile.weight || 0);
                        const heightNum = parseInt(loadedProfile.height || 0, 10);
                        const targetWeightNum = parseFloat(loadedProfile.targetWeight || 0);

                        if (weightNum > 0 && heightNum > 0 && age > 0 && loadedProfile.gender) {
                            const tdee = calculateTDEE({
                                weight: weightNum,
                                height: heightNum,
                                age: age,
                                gender: loadedProfile.gender,
                                activityLevel: loadedProfile.activityLevel || 'moderado',
                                targetWeight: targetWeightNum > 0 ? targetWeightNum : undefined,
                                goalDate: loadedProfile.goalDate,
                            } as BMRInput);
                            setCalorieGoal(tdee);
                        }
                    }
                } catch (e) {
                    console.error("Falha ao carregar dados do perfil:", e);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }, [])
    );

    if (isLoading || !profile) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColor} />
            </SafeAreaView>
        );
    }

    const age = calculateAge(profile.birthDate);
    const imcData = calculateIMC(profile.weight, profile.height);
    const netBalance = dailyConsumed - dailySpent;
    const remainingCalories = calorieGoal - dailyConsumed;

    // ✅ Textos dinâmicos
    const netBalanceText = netBalance < 0 ? 'Você gastou mais do que consumiu' : netBalance > 0 ? 'Você consumiu mais do que gastou' : 'Balanço neutro';
    const goalStatusText = remainingCalories < 0 ? 'Você ultrapassou a sua meta' : 'Abaixo da sua meta';
    if (dailyConsumed === calorieGoal && calorieGoal > 0) {
        // Se for exatamente igual, exibe uma mensagem de sucesso
        // goalStatusText = 'Você atingiu sua meta!';
    }


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Perfil',
                    headerRight: () => (
                        <Pressable onPress={() => router.push('/perfil-modal')}>
                            <Ionicons name="pencil" size={24} color="white" style={{ marginRight: 15 }} />
                        </Pressable>
                    ),
                }}
            />
            
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Olá, {profile.name}</Text>
                    <Text style={styles.subHeader}>Idade: {age} anos | Altura: {profile.height}cm </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Suas Métricas </Text>
                    <View style={styles.cardContent}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoValue}>{profile.weight}kg </Text>
                            <Text style={styles.infoLabel}>Peso Atual </Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoValue, { color: imcData.color }]}>{imcData.value} </Text>
                            <Text style={styles.infoLabel}>IMC </Text>
                            <Text style={[styles.infoClassification, { color: imcData.color }]}>{imcData.text} </Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Balanço Energético do Dia </Text>
                    <View style={styles.cardContent}>
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoValue, { color: '#2ecc71' }]}>{dailyConsumed} Kcal </Text>
                            <Text style={styles.infoLabel}>Consumidas</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoValue, { color: '#e74c3c' }]}>{dailySpent} Kcal</Text>
                            <Text style={styles.infoLabel}>Gastas</Text>
                        </View>
                    </View>
                    <View style={styles.netBalanceContainer}>
                        <Text style={styles.infoLabel}>Balanço Líquido </Text>
                        <Text style={styles.netBalanceValue}>{netBalance > 0 ? '+' : ''}{netBalance} Kcal </Text>
                        <Text style={styles.cardSubtext}>{netBalanceText} </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Progresso da Meta Diária </Text>
                    <View style={styles.cardContent}>
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoValue, { color: '#2ecc71' }]}>{dailyConsumed} Kcal </Text>
                            <Text style={styles.infoLabel}>Consumidas </Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.infoValue, { color: themeColor }]}>{calorieGoal} Kcal </Text>
                            <Text style={styles.infoLabel}>Sua Meta </Text>
                        </View>
                    </View>
                    <View style={styles.netBalanceContainer}>
                        <Text style={styles.infoLabel}>Balanço da Meta </Text>
                        <Text style={styles.netBalanceValue}>{remainingCalories} Kcal</Text>
                        <Text style={styles.cardSubtext}>{goalStatusText} </Text>
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 30, alignItems: 'center', paddingTop: 20 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#333' },
    subHeader: { fontSize: 16, color: 'gray', marginTop: 5 },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    cardContent: { flexDirection: 'row', justifyContent: 'space-around' },
    infoBox: { alignItems: 'center', flex: 1 },
    infoValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
    infoLabel: { fontSize: 14, color: 'gray', textAlign: 'center', marginTop: 5 },
    infoClassification: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    netBalanceContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    netBalanceValue: { fontSize: 32, fontWeight: 'bold', color: themeColor },
    cardSubtext: {
        fontSize: 14,
        color: 'gray',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
});