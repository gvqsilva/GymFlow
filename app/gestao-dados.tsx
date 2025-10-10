// app/gestao-dados.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable, Alert } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSportsContext } from '../context/SportsProvider';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

interface ActivityOption {
    id: string;
    name: string;
    isSport: boolean | 'divider';
    groups?: string;
}

export default function DataManagementScreen() {
    const { workouts } = useWorkouts();
    const { sports } = useSportsContext();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // 'refreshSports()' já não é necessário aqui
            const loadHistory = async () => {
                try {
                    const historyJSON = await AsyncStorage.getItem('workoutHistory');
                    setHistory(historyJSON ? JSON.parse(historyJSON) : []);
                } catch (e) {
                    console.error("Falha ao carregar o histórico:", e);
                    setHistory([]);
                }
            };
            loadHistory();
        }, [])
    );

    const activityOptions = useMemo((): ActivityOption[] => {
        const dynamicSports: ActivityOption[] = sports
            .filter(sport => sport.id !== 'academia')
            .map(sport => ({
                id: sport.id,
                name: sport.name,
                isSport: true,
            }));

        const gymWorkouts: ActivityOption[] = Object.values(workouts).map(w => ({ 
            id: w.id, 
            name: w.name, 
            isSport: false, 
            groups: w.groups 
        }));
        
        return [
            ...dynamicSports, 
            { id: 'divider', name: 'Fichas de Treino', isSport: 'divider' },
            ...gymWorkouts
        ];
    }, [sports, workouts]);

    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        if (!Array.isArray(history)) return {};
        history.forEach(entry => {
            if (entry && entry.date) {
                const dateStr = entry.date;
                if (marked[dateStr]) {
                    if(marked[dateStr].dots.length < 3) marked[dateStr].dots.push({ color: themeColor });
                } else {
                    marked[dateStr] = { marked: true, dots: [{ color: themeColor }] };
                }
            }
        });
        return marked;
    }, [history]);

    const onDayPress = (day: { dateString: string }) => {
        setSelectedDay(day.dateString);
        setIsDetailsModalVisible(true);
    };
    
    const handleAddActivitySelect = (item: ActivityOption) => {
        setIsAddModalVisible(false);
        setIsDetailsModalVisible(false);

        if (item.isSport === true) {
            router.push({ pathname: '/logEsporte', params: { esporte: item.name, date: selectedDay } });
        } else if (item.isSport === false) {
            router.push({ 
                pathname: "/fichas/[id]", 
                params: { id: item.id, title: item.name, date: selectedDay } 
            });
        }
    };

    const handleDeleteActivity = (activityIdToDelete: string) => {
        Alert.alert( "Apagar Atividade?", "Tem a certeza que deseja apagar este registo?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Apagar", style: "destructive", onPress: async () => {
                        const newHistory = history.filter(entry => entry.id !== activityIdToDelete);
                        await AsyncStorage.setItem('workoutHistory', JSON.stringify(newHistory));
                        setHistory(newHistory);
                    }
                }
            ]
        );
    };

    const selectedDayActivities = history.filter(entry => entry.date === selectedDay);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Gerir Histórico", headerShown: true, headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }} />
            <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{ selectedDayBackgroundColor: themeColor, arrowColor: themeColor, todayTextColor: themeColor }}
            />

            <Modal animationType="slide" transparent={true} visible={isDetailsModalVisible} onRequestClose={() => setIsDetailsModalVisible(false)}>
                <Pressable style={styles.modalContainer} onPress={() => setIsDetailsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Atividades do Dia</Text>
                        <FlatList
                            data={selectedDayActivities}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const workoutName = item.details?.type ? (workouts[item.details.type]?.name || item.details.type) : '';
                                const activityName = item.category === 'Musculação' ? `Musculação (${workoutName})` : item.category;
                                return (
                                    <View style={styles.activityItem}>
                                        <Text style={styles.activityName} numberOfLines={1}>{activityName}</Text>
                                        <Pressable onPress={() => handleDeleteActivity(item.id)} style={styles.deleteButton}>
                                            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                                        </Pressable>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma atividade registada neste dia.</Text>}
                        />
                        <View style={styles.modalFooter}>
                            <Pressable style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
                                <Ionicons name="add" size={20} color={themeColor} />
                                <Text style={styles.addButtonText}>Adicionar Atividade</Text>
                            </Pressable>
                            <Pressable style={styles.closeButton} onPress={() => setIsDetailsModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Fechar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}>
                 <Pressable style={styles.modalContainer} onPress={() => setIsAddModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Escolha uma Atividade</Text>
                        <FlatList
                            data={activityOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                if (item.isSport === 'divider') {
                                    return <Text style={styles.dividerText}>{item.name}</Text>;
                                }
                                return (
                                    <Pressable style={styles.optionButton} onPress={() => handleAddActivitySelect(item)}>
                                        <Text style={styles.optionButtonText}>{item.name}</Text>
                                        {'groups' in item && item.groups && (
                                            <Text style={styles.optionButtonSubtitle}>{item.groups}</Text>
                                        )}
                                    </Pressable>
                                );
                            }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    calendar: { margin: 10, borderRadius: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%'},
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    activityName: { fontSize: 16, color: '#333', flex: 1 },
    deleteButton: { paddingLeft: 15 },
    noActivityText: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 20 },
    modalFooter: { marginTop: 20, gap: 10 },
    addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2ff', padding: 15, borderRadius: 10 },
    addButtonText: { color: themeColor, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    closeButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center' },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    optionButton: { backgroundColor: '#f0f2f5', padding: 20, borderRadius: 10, marginBottom: 10 },
    optionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    optionButtonSubtitle: { fontSize: 12, color: 'gray', marginTop: 4 },
    dividerText: { fontSize: 16, fontWeight: 'bold', color: 'gray', marginVertical: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
});