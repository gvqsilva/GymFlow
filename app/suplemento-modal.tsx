// app/suplemento-modal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSupplements, TrackingType } from '../hooks/useSupplements';

const themeColor = '#5a4fcf';

export default function SupplementModal() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { supplements, addSupplement, updateSupplement } = useSupplements();
    const router = useRouter();

    const [name, setName] = useState('');
    const [dose, setDose] = useState('');
    const [unit, setUnit] = useState('');
    const [trackingType, setTrackingType] = useState<TrackingType>('daily_check');

    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            const supplementToEdit = supplements.find(s => s.id === id);
            if (supplementToEdit) {
                setName(supplementToEdit.name);
                setDose(supplementToEdit.dose.toString());
                setUnit(supplementToEdit.unit);
                setTrackingType(supplementToEdit.trackingType);
            }
        }
    }, [id, supplements, isEditing]);

    const handleSave = () => {
        if (!name || !dose || !unit) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }

        const supplementData = {
            name,
            dose: parseFloat(dose.replace(',', '.')) || 0,
            unit,
            trackingType,
        };

        if (isEditing) {
            updateSupplement({ ...supplementData, id });
        } else {
            addSupplement(supplementData);
        }
        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: isEditing ? 'Editar Suplemento' : 'Novo Suplemento' }} />
            
            <Text style={styles.label}>Nome do Suplemento</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Creatina Monohidratada" />

            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.label}>Dose</Text>
                    <TextInput style={styles.input} value={dose} onChangeText={setDose} keyboardType="numeric" placeholder="Ex: 6"/>
                </View>
                <View style={[styles.column, { marginRight: 0 }]}>
                    <Text style={styles.label}>Unidade</Text>
                    <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Ex: g, mg, scoop" />
                </View>
            </View>

            <Text style={styles.label}>Tipo de Registo</Text>
            <View style={styles.trackingContainer}>
                <Pressable
                    style={[styles.trackingButton, trackingType === 'daily_check' && styles.trackingSelected]}
                    onPress={() => setTrackingType('daily_check')}
                >
                    <Text style={[styles.trackingText, trackingType === 'daily_check' && styles.trackingTextSelected]}>Marcação Diária</Text>
                </Pressable>
                <Pressable
                    style={[styles.trackingButton, trackingType === 'counter' && styles.trackingSelected]}
                    onPress={() => setTrackingType('counter')}
                >
                    <Text style={[styles.trackingText, trackingType === 'counter' && styles.trackingTextSelected]}>Contador</Text>
                </Pressable>
            </View>

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
    trackingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
    trackingButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    trackingSelected: { backgroundColor: themeColor, borderColor: themeColor },
    trackingText: { fontSize: 15, color: '#333' },
    trackingTextSelected: { color: 'white', fontWeight: 'bold' },
    saveButton: { backgroundColor: themeColor, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});