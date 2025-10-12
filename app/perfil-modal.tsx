// app/perfil-modal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Platform, ScrollView } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { calculateTDEE, ACTIVITY_LEVELS, ActivityLevelKey, BMRInput } from '../utils/calorieCalculator'; 

const themeColor = '#5a4fcf';
const PROFILE_KEY = 'userProfile';

export default function PerfilModal() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState<'Masculino' | 'Feminino' | null>(null); 
    const [activityLevel, setActivityLevel] = useState<ActivityLevelKey>('moderado'); 
    const [targetWeight, setTargetWeight] = useState('');
    const [goalDate, setGoalDate] = useState<Date | null>(null);
    const [showGoalDatePicker, setShowGoalDatePicker] = useState(false);
    const [tdeeResult, setTdeeResult] = useState(0); 
    
    const calculateAge = (date: Date) => {
        if (!date) return 0;
        const today = new Date();
        let age = today.getFullYear() - new Date(date).getFullYear();
        const m = today.getMonth() - new Date(date).getMonth();
        if (m < 0 || (m === 0 && today.getDate() < new Date(date).getDate())) {
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

    const calculateIMC = (w: string, h: string) => {
        const weightNum = parseFloat(w.replace(',', '.'));
        const heightNum = parseInt(h, 10);
        if (weightNum > 0 && heightNum > 0) {
            const heightInMeters = heightNum / 100;
            const imc = weightNum / (heightInMeters * heightInMeters);
            const classification = getBmiClassification(imc);
            return {
                value: imc.toFixed(1),
                text: classification.text,
                color: classification.color
            };
        }
        return { value: 'N/A', text: '', color: 'gray' };
    };
    
    const performTDEECalculation = useCallback(() => {
        const w = parseFloat(weight.replace(',', '.'));
        const h = parseInt(height, 10);
        const age = calculateAge(birthDate);
        const tWeight = parseFloat(targetWeight.replace(',', '.'));

        if (w > 0 && h > 0 && age > 0 && gender) {
            const tdee = calculateTDEE({ 
                weight: w, 
                height: h, 
                age, 
                gender, 
                activityLevel,
                targetWeight: tWeight > 0 ? tWeight : undefined,
                goalDate: goalDate ? goalDate.toISOString() : undefined,
            } as BMRInput);
            setTdeeResult(tdee);
        } else {
            setTdeeResult(0);
        }
    }, [weight, height, birthDate, gender, activityLevel, targetWeight, goalDate]);

    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                const profileJSON = await AsyncStorage.getItem(PROFILE_KEY);
                if (profileJSON) {
                    const profile = JSON.parse(profileJSON);
                    setName(profile.name || '');
                    setWeight(profile.weight?.toString() || '');
                    setHeight(profile.height?.toString() || '');
                    setBirthDate(profile.birthDate ? new Date(profile.birthDate) : new Date());
                    setGender(profile.gender || null); 
                    setActivityLevel(profile.activityLevel || 'moderado'); 
                    setTargetWeight(profile.targetWeight?.toString() || '');
                    setGoalDate(profile.goalDate ? new Date(profile.goalDate) : null);
                }
            };
            loadProfile();
        }, [])
    );
    
    useEffect(() => {
        performTDEECalculation();
    }, [performTDEECalculation]);

    const handleSave = async () => {
        if (!name || !weight || !height || !birthDate || !gender) {
            Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const profileData = {
                name,
                weight: parseFloat(weight.replace(',', '.')),
                height: parseInt(height, 10),
                birthDate: birthDate.toISOString(),
                gender, 
                activityLevel,
                targetWeight: parseFloat(targetWeight.replace(',', '.')) || null,
                goalDate: goalDate ? goalDate.toISOString() : null,
            };
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
            Alert.alert("Sucesso!", "O seu perfil foi atualizado.");
            router.back();
        } catch (e) {
            Alert.alert("Erro", "Não foi possível guardar o perfil.");
        }
    };

    const onChangeBirthDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };
    
    const onChangeGoalDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowGoalDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setGoalDate(selectedDate);
        }
    };

    const age = calculateAge(birthDate);
    const imcData = calculateIMC(weight, height);
    const currentGoal = parseFloat(targetWeight) < parseFloat(weight) ? 'Déficit' : parseFloat(targetWeight) > parseFloat(weight) ? 'Superávit' : 'Manutenção';

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Editar Perfil' }} />
            
            <Text style={styles.label}>O seu Nome</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Gabriel" />

            <Text style={styles.label}>O seu Peso (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Ex: 75.5" keyboardType="numeric" />
            
            <Text style={styles.label}>A sua Altura (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="Ex: 180" keyboardType="number-pad" />

            <Text style={styles.label}>Data de Nascimento</Text>
            <Pressable onPress={() => setShowDatePicker(true)}>
                <TextInput style={styles.input} value={birthDate.toLocaleDateString('pt-BR')} editable={false} />
            </Pressable>
            
            {showDatePicker && (
                <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeBirthDate}
                />
            )}

            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
                <Pressable
                    style={[styles.genderButton, gender === 'Masculino' && styles.genderSelected]}
                    onPress={() => setGender('Masculino')}
                >
                    <Text style={[styles.genderText, gender === 'Masculino' && styles.genderTextSelected]}>Masculino</Text>
                </Pressable>
                <Pressable
                    style={[styles.genderButton, gender === 'Feminino' && styles.genderSelected]}
                    onPress={() => setGender('Feminino')}
                >
                    <Text style={[styles.genderText, gender === 'Feminino' && styles.genderTextSelected]}>Feminino</Text>
                </Pressable>
            </View>

            <View style={styles.goalCard}>
                <Text style={styles.cardTitle}>Definir Objetivos (Opcional)</Text>
                
                <Text style={styles.label}>Peso Meta (kg)</Text>
                <TextInput 
                    style={styles.input} 
                    value={targetWeight} 
                    onChangeText={setTargetWeight} 
                    placeholder="Ex: 80" 
                    keyboardType="numeric" 
                />

                <Text style={styles.label}>Prazo para a Meta</Text>
                <Pressable onPress={() => setShowGoalDatePicker(true)}>
                    <TextInput 
                        style={styles.input} 
                        value={goalDate ? goalDate.toLocaleDateString('pt-BR') : 'Selecione uma data'} 
                        editable={false} 
                        placeholderTextColor="#999"
                    />
                </Pressable>
                
                {showGoalDatePicker && (
                    <DateTimePicker
                        value={goalDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onChangeGoalDate}
                        minimumDate={new Date()}
                    />
                )}
            </View>

            <Text style={styles.label}>Nível de Atividade Semanal</Text>
            <View style={styles.activityContainer}>
                {Object.entries(ACTIVITY_LEVELS).map(([key, item]) => (
                    <Pressable
                        key={key}
                        style={[styles.activityButton, activityLevel === key && styles.activitySelected]}
                        onPress={() => setActivityLevel(key as ActivityLevelKey)}
                    >
                        <Text style={[styles.activityText, activityLevel === key && styles.activityTextSelected]}>
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Idade </Text>
                    <Text style={styles.infoValue}>{age} anos </Text>
                </View>
                <View style={[styles.infoBox, styles.infoBoxCentered]}>
                    <Text style={styles.infoLabel}>Sua Meta Diária </Text>
                    <Text style={[styles.infoValue, { color: themeColor, fontSize: 24 }]}>{tdeeResult > 0 ? tdeeResult : '...'} </Text>
                    <Text style={styles.infoClassification}>Kcal ({currentGoal}) </Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>IMC </Text>
                    <Text style={[styles.infoValue, { color: imcData.color }]}>{imcData.value} </Text>
                    <Text style={[styles.infoClassification, { color: imcData.color }]}>{imcData.text} </Text>
                </View>
            </View>
            
            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Perfil </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
    label: { fontSize: 16, marginBottom: 8, color: 'gray', fontWeight: '500' },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#333' },
    saveButton: { backgroundColor: themeColor, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    infoBox: { alignItems: 'center', flex: 1 },
    infoBoxCentered: { 
        borderLeftWidth: 1, 
        borderRightWidth: 1, 
        borderColor: '#eee', 
        marginHorizontal: 10,
        paddingHorizontal: 10,
    },
    infoLabel: { fontSize: 14, color: 'gray', textAlign: 'center' },
    infoValue: { fontSize: 20, fontWeight: 'bold', color: themeColor, marginTop: 5 },
    infoClassification: { fontSize: 12, fontWeight: 'bold', marginTop: 2, textTransform: 'capitalize' },
    genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
    genderButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: 'white' },
    genderSelected: { backgroundColor: themeColor, borderColor: themeColor },
    genderText: { fontSize: 16, color: '#333' },
    genderTextSelected: { color: 'white', fontWeight: 'bold' },
    goalCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: themeColor,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    activityContainer: { marginBottom: 15, gap: 10 },
    activityButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
    },
    activitySelected: {
        backgroundColor: '#eef2ff', 
        borderColor: themeColor,
        borderWidth: 2,
    },
    activityText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    activityTextSelected: {
        color: themeColor,
        fontWeight: 'bold',
    },
});