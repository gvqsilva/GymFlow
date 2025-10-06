// app/gestao-dados.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable, Alert } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../hooks/useWorkouts';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

// Configura o calendário para português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function DataManagementScreen() {
    const { workouts } = useWorkouts();
    const [history, setHistory] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadHistory = async () => {
                try {
                    const historyJSON = await AsyncStorage.getItem('workoutHistory');
                    if (historyJSON) {
                        const parsedHistory = JSON.parse(historyJSON);
                        if (Array.isArray(parsedHistory)) {
                            setHistory(parsedHistory);
                        } else {
                            setHistory([]);
                        }
                    } else {
                        setHistory([]);
                    }
                } catch (e) {
                    console.error("Falha ao carregar ou processar o histórico:", e);
                    setHistory([]);
                }
            };
            loadHistory();
        }, [])
    );

    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        if (!Array.isArray(history)) return {};
        
        history.forEach(entry => {
            if (entry && entry.date) {
                const dateStr = entry.date;
                if (marked[dateStr]) {
                    if(marked[dateStr].dots.length < 3) {
                        marked[dateStr].dots.push({ color: themeColor });
                    }
                } else {
                    marked[dateStr] = { marked: true, dots: [{ color: themeColor }] };
                }
            }
        });
        return marked;
    }, [history]);

    const onDayPress = (day: { dateString: string }) => {
        const activitiesOnDay = history.filter(entry => entry.date === day.dateString);
        if (activitiesOnDay.length > 0) {
            setSelectedDay(day.dateString);
            setIsModalVisible(true);
        }
    };

    const handleDeleteActivity = (activityIdToDelete: string) => {
        Alert.alert(
            "Apagar Atividade?",
            "Tem a certeza que deseja apagar este registo?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Apagar", 
                    style: "destructive", 
                    onPress: async () => {
                        const newHistory = history.filter(entry => entry.id !== activityIdToDelete);
                        await AsyncStorage.setItem('workoutHistory', JSON.stringify(newHistory));
                        setHistory(newHistory);
                        
                        const remainingActivities = newHistory.filter(entry => entry.date === selectedDay);
                        if (remainingActivities.length === 0) {
                            setIsModalVisible(false);
                        }
                    }
                }
            ]
        );
    };

    const selectedDayActivities = history.filter(entry => entry.date === selectedDay);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
              options={{ 
                headerShown: true, 
                title: "Histórico e Dados", 
                headerStyle: { backgroundColor: themeColor }, 
                headerTintColor: '#fff' 
              }} 
            />
            <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{
                    selectedDayBackgroundColor: themeColor,
                    arrowColor: themeColor,
                    todayTextColor: themeColor,
                }}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable style={styles.modalContainer} onPress={() => setIsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Atividades do Dia</Text>
                        <FlatList
                            data={selectedDayActivities}
                            keyExtractor={(item) => item.id || `${item.category}-${Math.random()}`}
                            renderItem={({ item }) => {
                                const workoutName = item.details?.type ? (workouts[item.details.type]?.name || item.details.type) : '';
                                const activityName = item.category === 'Musculação' ? `Musculação (${workoutName})` : item.category;
                                const duration = item.details?.duration;
                                const displayValue = item.category === 'Musculação' 
                                    ? '60 min'
                                    : duration ? `${duration} min` : '';

                                return (
                                    <View style={styles.activityItem}>
                                        <View style={styles.activityInfo}>
                                            <Text style={styles.activityName}>{activityName}</Text>
                                            {displayValue && <Text style={styles.activityDetail}>{displayValue}</Text>}
                                        </View>
                                        <Pressable onPress={() => handleDeleteActivity(item.id)} style={styles.deleteButton}>
                                            <Ionicons name="close-circle" size={26} color="#e74c3c" />
                                        </Pressable>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma atividade registada.</Text>}
                        />
                        <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    calendar: {
        margin: 10,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        paddingBottom: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '40%',
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityInfo: {
        flex: 1,
    },
    activityName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500'
    },
    activityDetail: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
    },
    deleteButton: {
        paddingLeft: 15,
    },
    noActivityText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 16,
        paddingVertical: 20,
    },
    closeButton: {
        backgroundColor: themeColor,
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

