// app/gerir-suplementos.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSupplements, Supplement } from '../hooks/useSupplements';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

export default function ManageSupplementsScreen() {
    const { supplements, isLoading, deleteSupplement, refreshSupplements } = useSupplements();
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            refreshSupplements();
        }, [])
    );

    const handleDelete = (supplement: Supplement) => {
        Alert.alert(
            `Apagar "${supplement.name}"?`,
            "Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: () => deleteSupplement(supplement.id) }
            ]
        );
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColor} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gerir Suplementos' }} />
            <FlatList
                data={supplements}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.info}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>{`${item.dose}${item.unit}`} - {item.trackingType === 'daily_check' ? 'Marcação diária' : 'Contador'}</Text>
                        </View>
                        <View style={styles.actions}>
                            <Pressable onPress={() => router.push({ pathname: '/suplemento-modal', params: { id: item.id } })}>
                                <Ionicons name="pencil" size={24} color={themeColor} />
                            </Pressable>
                            <Pressable style={{ marginLeft: 20 }} onPress={() => handleDelete(item)}>
                                <Ionicons name="trash-outline" size={24} color="red" />
                            </Pressable>
                        </View>
                    </View>
                )}
            />
            <Pressable style={styles.addButton} onPress={() => router.push('/suplemento-modal')}>
                <Ionicons name="add" size={32} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, },
    info: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: themeColor, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});