// app/gestao-dados.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable, Alert } from 'react-native';
import { Stack, useFocusEffect, useRouter, useNavigation } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSupplements } from '../hooks/useSupplements'; 
import { useSports } from '../hooks/useSports'; // NOVO: Importa o hook de desportos
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const themeColor = '#5a4fcf';
const SUPPLEMENTS_HISTORY_KEY = 'supplements_history'; 

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
    const { supplements, refreshSupplements } = useSupplements(); 
    const { sports } = useSports(); // CORRIGIDO: OBTÉM A LISTA DINÂMICA
    const router = useRouter();
    const navigation = useNavigation();

    const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
    const [supplementsHistory, setSupplementsHistory] = useState<Record<string, any>>({});
    const [selectedDay, setSelectedDay] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false); 
    const [editMode, setEditMode] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshSupplements(); 
            const loadAllHistory = async () => {
                const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
                setWorkoutHistory(workoutHistoryJSON ? JSON.parse(workoutHistoryJSON) : []);
                
                const supplementsHistoryJSON = await AsyncStorage.getItem(SUPPLEMENTS_HISTORY_KEY);
                setSupplementsHistory(supplementsHistoryJSON ? JSON.parse(supplementsHistoryJSON) : {});
            };
            loadAllHistory();
        }, [refreshSupplements])
    );
    
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={() => setEditMode(prev => !prev)} style={{ marginRight: 15 }}>
                    <Ionicons 
                        name={editMode ? "close-circle" : "pencil"} 
                        size={26} 
                        color={editMode ? '#ff8a80' : 'white'} 
                    />
                </Pressable>
            ),
        });
    }, [navigation, editMode]);

    const markedDates = useMemo(() => {
        const marked: { [key: string]: any } = {};
        if (!Array.isArray(workoutHistory)) return {};
        workoutHistory.forEach(entry => {
            const dateStr = entry.date;
            if (!dateStr) return;
            if (!marked[dateStr]) {
                marked[dateStr] = { dots: [] };
            }
            marked[dateStr].dots.push({ color: themeColor });
        });
        return marked;
    }, [workoutHistory]);

    const onDayPress = (day: { dateString: string }) => {
        setSelectedDay(day.dateString);
        setIsModalVisible(true);
    };

    const handleDeleteActivity = (activityIdToDelete: string) => {
        Alert.alert("Apagar Atividade?", "Tem a certeza que deseja apagar este registo?",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: async () => {
                        const newHistory = workoutHistory.filter(entry => entry.id !== activityIdToDelete);
                        await AsyncStorage.setItem('workoutHistory', JSON.stringify(newHistory));
                        setWorkoutHistory(newHistory);
                        Toast.show({ type: 'success', text1: 'Atividade apagada com sucesso.' });
                    }
                }
            ]
        );
    };
    
    const handleEditActivity = (activity: any) => {
        Toast.show({
            type: 'info',
            text1: 'Função de Edição',
            text2: 'A edição direta de registos de atividade ainda não está implementada.'
        });
    };

    // CORRIGIDO: Lógica de options agora usa a lista dinâmica 'sports'
    const activityOptions = useMemo((): ActivityOption[] => {
        const dynamicSports: ActivityOption[] = sports
            .filter((sport: any) => sport.id !== 'academia') // Remove "Academia" para não duplicar a opção de treino
            .map((sport: any) => ({
                id: sport.id,
                name: sport.name,
                isSport: true,
            }));

        const gymWorkouts: ActivityOption[] = Object.values(workouts).map((w: any) => ({ 
            id: w.id, 
            name: w.name, 
            isSport: false, 
            groups: w.groups 
        }));
        
        return [
            ...dynamicSports, 
            { id: 'divider', name: 'Fichas de Treino (Musculação)', isSport: 'divider' as any },
            ...gymWorkouts
        ];
    }, [workouts, sports]); // Depende agora de 'sports' do hook


    const handleAddActivitySelect = (item: ActivityOption) => {
        setIsAddModalVisible(false);

        if (item.isSport === true) {
            router.push({ pathname: '/logEsporte', params: { esporte: item.name, date: selectedDay } });
        } else if (item.isSport === false) {
            router.push({ 
                pathname: "/fichas/[id]", 
                params: { id: item.id, title: item.name, date: selectedDay } 
            });
        }
    };


    const selectedDayActivities = workoutHistory.filter(entry => entry.date === selectedDay);
    const supplementsOnSelectedDay = supplementsHistory[selectedDay] || {};
    const hasConfiguredSupplements = supplements.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: editMode ? "Modo de Edição" : "Histórico e Dados" }} />
            <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markingType={'multi-dot'}
                markedDates={markedDates}
                theme={{ selectedDayBackgroundColor: themeColor, arrowColor: themeColor, todayTextColor: themeColor }}
            />
            {editMode && <Text style={styles.editModeBanner}>Modo de Edição Ativado: toque num registo para apagar.</Text>}

            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <Pressable style={styles.modalContainer} onPress={() => setIsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Resumo do Dia </Text>
                        
                        {hasConfiguredSupplements && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Suplementos</Text>
                                {supplements.map(supplement => {
                                    const value = supplementsOnSelectedDay[supplement.id] || (supplement.trackingType === 'daily_check' ? false : 0);
                                    const isTaken = value === true;
                                    const count = typeof value === 'number' ? value : 0;

                                    return (
                                        <View key={supplement.id} style={styles.supplementItem}>
                                            <Text style={styles.supplementName}>{supplement.name} </Text>
                                            
                                            {supplement.trackingType === 'daily_check' ? (
                                                <View style={styles.statusContainer}>
                                                    <Ionicons name={isTaken ? "checkmark-circle" : "close-circle"} size={20} color={isTaken ? "#2ecc71" : "#e74c3c"} />
                                                    <Text style={[styles.supplementStatus, { color: isTaken ? '#2ecc71' : '#e74c3c' }]}>{isTaken ? 'Tomada' : 'Não Tomada'} </Text>
                                                </View>
                                            ) : (
                                                <Text style={[styles.supplementStatusValue, { color: count > 0 ? themeColor : 'gray' }]}>{count} dose(s) </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Atividades Físicas</Text>
                            <FlatList
                                data={selectedDayActivities}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const workoutName = item.details?.type ? (workouts[item.details.type]?.name || item.details.type) : '';
                                    const activityName = item.category === 'Musculação' ? `Musculação (${workoutName})` : item.category;

                                    const duration = item.details?.duration;
                                    const isSwimmingWithDistance = item.category.toLowerCase() === 'natação' && item.details?.distance > 0;
                                    
                                    const activityDetailString = (
                                        (isSwimmingWithDistance ? `${item.details.distance} m / ` : '') +
                                        (duration ? `${duration} min` : '')
                                    ).trim();
                                    
                                    return (
                                        <Pressable 
                                            style={styles.activityItem} 
                                            onPress={editMode ? () => handleDeleteActivity(item.id) : undefined}
                                        >
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityName} numberOfLines={1}>{activityName} </Text>
                                            </View>
                                            
                                            {activityDetailString ? (
                                                <Text style={styles.activityDetail}>{activityDetailString} </Text>
                                            ) : null}

                                            {editMode && (
                                                <Ionicons name="trash-outline" size={24} color="#e74c3c" style={{ marginLeft: 15 }} />
                                            )}
                                        </Pressable>
                                    );
                                }}
                                ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma atividade registada. </Text>}
                            />
                        </View>
                        
                        {editMode && (
                            <Pressable style={styles.addButton} onPress={() => {
                                setIsModalVisible(false);
                                setIsAddModalVisible(true);
                            }}>
                                <Ionicons name="add-circle" size={24} color="white" />
                                <Text style={styles.addButtonText}>Adicionar Atividade a {selectedDay} </Text>
                            </Pressable>
                        )}

                        <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Fechar </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal de Escolha de Atividade (isAddModalVisible) */}
            <Modal animationType="slide" transparent={true} visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}>
                 <Pressable style={styles.modalContainer} onPress={() => setIsAddModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Atividade em {selectedDay} </Text>
                        <FlatList
                            data={activityOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                if (item.isSport === 'divider') {
                                    return <Text style={styles.dividerText}>{item.name }</Text>;
                                }
                                return (
                                    <Pressable style={styles.optionButton} onPress={() => handleAddActivitySelect(item)}>
                                        <Text style={styles.optionButtonText}>{item.name} </Text>
                                        {'groups' in item && item.groups && (
                                            <Text style={styles.optionButtonSubtitle}>{item.groups} </Text>
                                        )}
                                    </Pressable>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma opção disponível. </Text>}
                        />
                        <Pressable style={styles.closeButton} onPress={() => setIsAddModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Cancelar </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* FAB para alternar o modo de edição (o lápis que alterna para a cruz) */}
            <Pressable 
                style={styles.fab} 
                onPress={() => setEditMode(prev => !prev)}
            >
                <Ionicons 
                    name={editMode ? "close" : "pencil"}
                    size={30} 
                    color="white" 
                />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    calendar: { margin: 10, borderRadius: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    editModeBanner: { textAlign: 'center', color: '#c0392b', fontWeight: 'bold', padding: 10, backgroundColor: '#ffdddd' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%'},
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, textAlign: 'center' },
    // Estilos de Suplementos
    supplementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    supplementName: { fontSize: 16, color: '#333' },
    supplementStatus: { fontSize: 16, fontWeight: '500', marginLeft: 5 },
    supplementStatusValue: { fontSize: 16, fontWeight: 'bold', color: themeColor },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    // Estilos de Atividades
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    activityInfo: { flex: 1, marginRight: 10 },
    activityName: { fontSize: 16, color: '#333', fontWeight: '500', flexShrink: 1 },
    activityDetail: { fontSize: 14, color: 'gray', fontWeight: '500' }, 
    actions: { flexDirection: 'row', alignItems: 'center' },
    actionButton: { padding: 5, marginLeft: 10 },
    noActivityText: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 20 },
    closeButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    // Estilo do FAB
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: themeColor,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 10,
    },
    // Estilos para o Botão Adicionar
    addButton: { flexDirection: 'row', backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    // Estilos do Modal de Escolha de Atividade
    dividerText: { fontSize: 16, fontWeight: 'bold', color: 'gray', marginVertical: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    optionButton: { backgroundColor: '#f0f2f5', padding: 15, borderRadius: 10, marginBottom: 8 },
    optionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    optionButtonSubtitle: { fontSize: 12, color: 'gray', marginTop: 4 },
});