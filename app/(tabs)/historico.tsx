// app/(tabs)/historico.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../../hooks/useWorkouts';

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

export default function HistoryScreen() {
    const { workouts } = useWorkouts();
    const [history, setHistory] = useState<any[]>([]);
    const [selectedDayActivities, setSelectedDayActivities] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Carrega o histórico de atividades
    useFocusEffect(
        useCallback(() => {
            const loadHistory = async () => {
                const historyJSON = await AsyncStorage.getItem('workoutHistory');
                setHistory(historyJSON ? JSON.parse(historyJSON) : []);
            };
            loadHistory();
        }, [])
    );

    // Processa o histórico para marcar os dias no calendário
    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        history.forEach(entry => {
            const dateStr = entry.date;
            if (marked[dateStr]) {
                marked[dateStr].dots.push({ color: themeColor });
            } else {
                marked[dateStr] = {
                    marked: true,
                    dots: [{ color: themeColor }],
                };
            }
        });
        return marked;
    }, [history]);

    // Função chamada ao tocar num dia
    const onDayPress = (day: { dateString: string }) => {
        const activitiesOnDay = history.filter(entry => entry.date === day.dateString);
        setSelectedDayActivities(activitiesOnDay);
        setIsModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
              options={{ 
                headerShown: true, 
                title: "Histórico", 
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
                    dotColor: themeColor,
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
                        <Text style={styles.modalTitle}>Atividades do Dia </Text>
                        <FlatList
                            data={selectedDayActivities}
                            keyExtractor={(item, index) => `${item.category}-${index}`}
                            renderItem={({ item }) => {
                                const workoutName = workouts[item.details?.type]?.name || item.details?.type;
                                const activityName = item.category === 'Musculação' ? `${item.category} (${workoutName})` : item.category;
                                
                                // LÓGICA ATUALIZADA para mostrar a duração
                                const duration = item.details?.duration;
                                const displayValue = item.category === 'Musculação' 
                                    ? '60 min' // Duração padrão para musculação
                                    : duration ? `${duration} min` : ''; // Duração registada para outros desportos

                                return (
                                    <View style={styles.activityItem}>
                                        <Text style={styles.activityName}>{activityName} </Text>
                                        {displayValue && <Text style={styles.activityDetail}>{displayValue}</Text>}
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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityName: {
        fontSize: 16,
        color: '#333',
    },
    activityDetail: { // Estilo renomeado de 'activityCalories' para ser mais genérico
        fontSize: 16,
        fontWeight: 'bold',
        color: themeColor,
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

