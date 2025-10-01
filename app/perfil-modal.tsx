// app/perfil-modal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Platform, ScrollView } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const themeColor = '#5a4fcf';
const PROFILE_KEY = 'userProfile';

export default function PerfilModal() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState<'Masculino' | 'Feminino' | null>(null); // NOVO ESTADO para o gênero

    useFocusEffect(
        React.useCallback(() => {
            const loadProfile = async () => {
                const profileJSON = await AsyncStorage.getItem(PROFILE_KEY);
                if (profileJSON) {
                    const profile = JSON.parse(profileJSON);
                    setName(profile.name || '');
                    setWeight(profile.weight?.toString() || '');
                    setHeight(profile.height?.toString() || '');
                    setBirthDate(profile.birthDate ? new Date(profile.birthDate) : new Date());
                    setGender(profile.gender || null); // Carrega o gênero guardado
                }
            };
            loadProfile();
        }, [])
    );

    const handleSave = async () => {
        // Validação atualizada
        if (!name || !weight || !height || !birthDate || !gender) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }

        try {
            const profileData = {
                name,
                weight: parseFloat(weight.replace(',', '.')) || 0,
                height: parseInt(height, 10) || 0,
                birthDate: birthDate.toISOString(),
                gender, // Guarda o gênero
            };
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
            Alert.alert("Sucesso!", "O seu perfil foi atualizado.");
            router.back();
        } catch (e) {
            Alert.alert("Erro", "Não foi possível guardar o perfil.");
        }
    };

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };
    
    const calculateAge = (date: Date) => {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
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

    const age = calculateAge(birthDate);
    const imcData = calculateIMC(weight, height);

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Editar Perfil' }} />
            <Text style={styles.label}>O seu Nome</Text>
            <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Ex: Gabriel"
            />

            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.label}>O seu Peso (kg)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={weight} 
                        onChangeText={setWeight} 
                        placeholder="Ex: 75.5"
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.column, { marginRight: 0 }]}>
                    <Text style={styles.label}>A sua Altura (cm)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={height} 
                        onChangeText={setHeight} 
                        placeholder="Ex: 180"
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            <Text style={styles.label}>Data de Nascimento</Text>
            <Pressable onPress={() => setShowDatePicker(true)}>
                <TextInput
                    style={styles.input}
                    value={birthDate.toLocaleDateString('pt-BR')}
                    editable={false}
                />
            </Pressable>
            
            {showDatePicker && (
                <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            {/* NOVA SECÇÃO DE GÊNERO */}
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
                <Pressable
                    style={[styles.genderButton, gender === 'Masculino' && styles.genderSelected, { marginRight: 5 }]}
                    onPress={() => setGender('Masculino')}
                >
                    <Text style={[styles.genderText, gender === 'Masculino' && styles.genderTextSelected]}>Masculino </Text>
                </Pressable>
                <Pressable
                    style={[styles.genderButton, gender === 'Feminino' && styles.genderSelected, { marginLeft: 5 }]}
                    onPress={() => setGender('Feminino')}
                >
                    <Text style={[styles.genderText, gender === 'Feminino' && styles.genderTextSelected]}>Feminino </Text>
                </Pressable>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Idade </Text>
                    <Text style={styles.infoValue}>{age} anos </Text>
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
    label: { fontSize: 16, marginBottom: 5, color: 'gray' },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#333' },
    row: { flexDirection: 'row' },
    column: { flex: 1, marginRight: 10 },
    saveButton: { backgroundColor: themeColor, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        marginBottom: 20,
    },
    infoBox: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: 'gray',
    },
    infoValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: themeColor,
        marginTop: 5,
    },
    infoClassification: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    // NOVOS ESTILOS para o seletor de gênero
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    genderButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    genderSelected: {
        backgroundColor: themeColor,
        borderColor: themeColor,
    },
    genderText: {
        fontSize: 16,
        color: '#333',
    },
    genderTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
});

