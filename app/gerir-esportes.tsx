// app/gerir-esportes.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useSportsContext, Sport } from '../context/SportsProvider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import IconPickerModal from '../components/IconPickerModal';
import { availableIcons, IconInfo } from '../constants/iconList';

const themeColor = '#5a4fcf';

export default function ManageSportsScreen() {
    const { sports, isLoading, addSport, deleteSport } = useSportsContext();
    const [newSportName, setNewSportName] = useState('');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<IconInfo>(availableIcons[0]);

    const handleAddSport = () => {
        if (newSportName.trim()) {
            addSport(newSportName, selectedIcon);
            setNewSportName('');
            setSelectedIcon(availableIcons[0]);
        }
    };

    const handleDeleteSport = (sport: Sport) => {
        Alert.alert(
            `Apagar "${sport.name}"?`, "Esta ação não pode ser desfeita.",
            [{ text: "Cancelar" }, { text: "Apagar", style: "destructive", onPress: () => deleteSport(sport.id) }]
        );
    };
    
    const SelectedIconComponent = selectedIcon.library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColor} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gerir Esportes' }} />
            
            <View style={styles.addSection}>
                <Pressable style={styles.iconPickerButton} onPress={() => setIsPickerVisible(true)}>
                    <SelectedIconComponent name={selectedIcon.name as any} size={30} color={themeColor} />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Nome do novo esporte"
                    value={newSportName}
                    onChangeText={setNewSportName}
                />
                <Pressable style={styles.addButton} onPress={handleAddSport}>
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </Pressable>
            </View>

            <FlatList
                data={sports.filter(s => s.id !== 'academia')}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Pressable onPress={() => handleDeleteSport(item)}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </Pressable>
                    </View>
                )}
                ListHeaderComponent={<Text style={styles.listHeader}>Esportes Personalizados</Text>}
            />

            <IconPickerModal 
                isVisible={isPickerVisible}
                onClose={() => setIsPickerVisible(false)}
                onSelectIcon={(icon) => setSelectedIcon(icon)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    addSection: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    iconPickerButton: {
        padding: 12,
        backgroundColor: '#f0f2f5',
        borderRadius: 10,
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        fontSize: 16,
        marginRight: 10
    },
    addButton: {
        backgroundColor: themeColor,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    listHeader: { fontSize: 16, color: 'gray', fontWeight: 'bold', marginTop: 20, marginBottom: 10, paddingLeft: 5 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
});