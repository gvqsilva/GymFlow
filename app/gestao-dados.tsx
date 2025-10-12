// app/gestao-dados.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useFocusEffect, useRouter, useNavigation } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSupplements } from '../hooks/useSupplements'; 
import { useSports } from '../hooks/useSports';
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

// --- FUNÇÕES AUXILIARES ---
const getLocalDateString = (date = new Date()) => date.toISOString().split('T')[0];

const processDailyFoodData = (entries: any[], today: string): { totalCalories: number } => {
    if (!Array.isArray(entries)) return { totalCalories: 0 };
    const todayEntries = entries.filter((entry: any) => entry.date === today);
    let totalCalories = 0;
    todayEntries.forEach((entry: any) => {
        const c = Number(entry?.data?.calories ?? 0);
        if (!Number.isNaN(c)) totalCalories += c;
    });
    return { totalCalories: Math.round(totalCalories) };
};

const getDailySummaryAndSpent = async (
    setDailyTotalConsumed: React.Dispatch<React.SetStateAction<number>>,
    setDailySpentCalories: React.Dispatch<React.SetStateAction<number>>
) => {
    try {
        const today = getLocalDateString();
        
        const foodEntriesJSON = await AsyncStorage.getItem('foodHistory');
        const foodEntries: any[] = foodEntriesJSON ? JSON.parse(foodEntriesJSON) : [];
        const { totalCalories } = processDailyFoodData(Array.isArray(foodEntries) ? foodEntries : [], today);

        const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
        const workoutEntries: any[] = workoutHistoryJSON ? JSON.parse(workoutHistoryJSON) : [];
        
        const totalSpent = (Array.isArray(workoutEntries) ? workoutEntries : [])
            .filter((entry: any) => entry.date === today)
            .reduce((sum: number, entry: any) => {
                const c = Number(entry?.details?.calories ?? 0);
                return sum + (Number.isNaN(c) ? 0 : c);
            }, 0);
            
        setDailyTotalConsumed(Math.round(totalCalories));
        setDailySpentCalories(Math.round(totalSpent));

    } catch (e) {
        console.error("Falha ao carregar o resumo diário e detalhes.", e);
        setDailyTotalConsumed(0);
        setDailySpentCalories(0);
    }
};

const aggregateDailyNetBalance = (foodEntries: any[], workoutEntries: any[]) => {
    const dailyMap: Record<string, { consumed: number, spent: number, net: number }> = {};
    const processEntries = (entries: any[], type: 'consumed' | 'spent') => {
        (Array.isArray(entries) ? entries : []).forEach(entry => {
            const dateStr = entry.date;
            if (!dateStr) return;
            const calories = entry.data?.calories || entry.details?.calories || 0;
            const c = Number(calories);
            if (Number.isNaN(c) || c === 0) return;
            if (!dailyMap[dateStr]) { dailyMap[dateStr] = { consumed: 0, spent: 0, net: 0 }; }
            
            if (type === 'consumed') {
                dailyMap[dateStr].consumed += c;
                dailyMap[dateStr].net += c;
            } else {
                dailyMap[dateStr].spent += c;
                dailyMap[dateStr].net -= c;
            }
        });
    };
    processEntries(foodEntries, 'consumed');
    processEntries(workoutEntries, 'spent');
    return dailyMap;
};

// --- FIM DAS FUNÇÕES AUXILIARES ---

interface ActivityOption {
    id: string;
    name: string;
    isSport: boolean | 'divider';
    groups?: string;
}

export default function DataManagementScreen() {
    const { workouts } = useWorkouts();
    const { supplements, refreshSupplements } = useSupplements(); 
    const { sports } = useSports();
    const router = useRouter();
    const navigation = useNavigation();

    const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
    const [foodHistory, setFoodHistory] = useState<any[]>([]);
    const [supplementsHistory, setSupplementsHistory] = useState<Record<string, any>>({});
    const [selectedDay, setSelectedDay] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false); 
    const [editMode, setEditMode] = useState(false);
    
    const [dailyTotalConsumed, setDailyTotalConsumed] = useState(0); 
    const [dailySpentCalories, setDailySpentCalories] = useState(0); 
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [modalConsumed, setModalConsumed] = useState(0);
    const [modalSpent, setModalSpent] = useState(0);

    const loadAllInitialData = useCallback(() => {
        setIsLoadingData(true);
        
        const loadHistoryForCalendar = async () => {
            try {
                const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
                setWorkoutHistory(workoutHistoryJSON ? JSON.parse(workoutHistoryJSON) : []);
                
                const foodHistoryJSON = await AsyncStorage.getItem('foodHistory');
                setFoodHistory(foodHistoryJSON ? JSON.parse(foodHistoryJSON) : []);
                
                const supplementsHistoryJSON = await AsyncStorage.getItem(SUPPLEMENTS_HISTORY_KEY);
                setSupplementsHistory(supplementsHistoryJSON ? JSON.parse(supplementsHistoryJSON) : {});
            } catch (e) {
                console.error('Erro ao carregar histórico inicial:', e);
            }
        };
        
        loadHistoryForCalendar();
        getDailySummaryAndSpent(setDailyTotalConsumed, setDailySpentCalories).then(() => {
             setIsLoadingData(false);
        });

    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshSupplements(); 
            loadAllInitialData();
        }, [refreshSupplements, loadAllInitialData])
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

    const calculateModalBalance = useCallback((day: string) => {
        const consumed = (foodHistory || [])
            .filter((entry: any) => entry.date === day)
            .reduce((sum: number, entry: any) => sum + (entry.data?.calories || 0), 0);

        const spent = (workoutHistory || [])
            .filter((entry: any) => entry.date === day)
            .reduce((sum: number, entry: any) => sum + (entry.details?.calories || 0), 0);
        
        setModalConsumed(Math.round(consumed));
        setModalSpent(Math.round(spent));
    }, [foodHistory, workoutHistory]);

    const balanceMarkedDates = useMemo(() => {
        const netBalanceMap = aggregateDailyNetBalance(foodHistory, workoutHistory);
        const marked: { [key: string]: any } = {};
        for (const dateStr in netBalanceMap) {
            const net = netBalanceMap[dateStr].net;
            const color = net <= 0 ? '#2ecc71' : '#e74c3c'; 
            
            if (netBalanceMap[dateStr].consumed > 0 || netBalanceMap[dateStr].spent > 0) {
                marked[dateStr] = {
                    dots: [{ color: color, key: 'balance' }],
                };
            }
        }
        return marked;
    }, [foodHistory, workoutHistory]);

    const onDayPress = (day: { dateString: string }) => {
        setSelectedDay(day.dateString);
        calculateModalBalance(day.dateString);
        setIsModalVisible(true);
    };

    const handleDeleteActivity = (activityIdToDelete: string) => {
        Alert.alert("Apagar Atividade?", "Tem a certeza que deseja apagar este registo?",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: "destructive", onPress: async () => {
                    const newHistory = (workoutHistory || []).filter(entry => entry.id !== activityIdToDelete);
                    await AsyncStorage.setItem('workoutHistory', JSON.stringify(newHistory));
                    setWorkoutHistory(newHistory); // Atualiza o estado para refletir na UI
                    loadAllInitialData(); // Recarrega os totais
                    Toast.show({ type: 'success', text1: 'Atividade apagada com sucesso.' });
                }}
            ]
        );
    };
    
    const activityOptions = useMemo((): ActivityOption[] => {
        const dynamicSports = (sports || [])
            .filter((sport: any) => sport.id !== 'academia')
            .map((sport: any) => ({
                id: sport.id,
                name: sport.name,
                isSport: true,
            }));

        const gymWorkouts: ActivityOption[] = Object.values(workouts || {}).map((w: any) => ({ 
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
    }, [workouts, sports]);

    const handleAddActivitySelect = (item: ActivityOption) => {
        setIsModalVisible(false);

        if (item.isSport === true) {
            router.push({ pathname: '/logEsporte', params: { esporte: item.name, date: selectedDay } });
        } else if (item.isSport === false) {
            router.push({ 
                pathname: "/fichas/[id]", 
                params: { id: item.id, title: item.name, date: selectedDay } 
            });
        }
    };

    const selectedDayActivities = (workoutHistory || []).filter(entry => entry.date === selectedDay);
    const supplementsOnSelectedDay = supplementsHistory[selectedDay] || {};
    const hasConfiguredSupplements = Array.isArray(supplements) && supplements.length > 0;

    const netBalance = Math.round(dailyTotalConsumed - dailySpentCalories);
    const balanceColor = netBalance < 0 ? '#2ecc71' : netBalance > 0 ? '#e74c3c' : themeColor;
    
    const modalNetBalance = modalConsumed - modalSpent;
    const modalBalanceColor = modalNetBalance <= 0 ? '#2ecc71' : '#e74c3c';

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: editMode ? "Modo de Edição" : "Histórico e Dados" }} />
            
            <View style={styles.calorieSummaryContainer}>
                <Text style={styles.sectionTitle}>Balanço de Hoje </Text>
                {isLoadingData ? (
                    <ActivityIndicator color={themeColor} />
                ) : (
                    <>
                        <View style={styles.calorieRow}>
                            <Text style={styles.calorieLabel}>Consumidas:</Text>
                            <Text style={[styles.calorieValue, { color: '#2ecc71' }]}>{dailyTotalConsumed} Kcal </Text>
                        </View>
                        <View style={styles.calorieRow}>
                            <Text style={styles.calorieLabel}>Gastas:</Text>
                            <Text style={[styles.calorieValue, { color: '#e74c3c' }]}>{dailySpentCalories} Kcal </Text>
                        </View>
                        <View style={styles.netBalanceRow}>
                            <Text style={styles.netBalanceLabel}>Balanço Líquido: </Text>
                            <Text style={[styles.netBalanceValue, { color: balanceColor }]}>{netBalance > 0 ? '+' : ''}{netBalance} Kcal</Text>
                        </View>
                    </>
                )}
            </View>

            <Calendar
                style={styles.calendar}
                onDayPress={onDayPress}
                markingType={'multi-dot'}
                markedDates={balanceMarkedDates}
                theme={{ selectedDayBackgroundColor: themeColor, arrowColor: themeColor, todayTextColor: themeColor }}
            />
            {editMode && <Text style={styles.editModeBanner}>Modo de Edição Ativado: Toque num registo para apagar. </Text>}

            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <Pressable style={styles.modalContainer} onPress={() => setIsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Resumo de {selectedDay}</Text>
                        
                        <View style={styles.modalBalanceCard}>
                            <View style={styles.modalInfoBox}>
                                <Text style={styles.modalInfoLabel}>Consumido </Text>
                                <Text style={[styles.modalInfoValue, { color: '#2ecc71' }]}>{modalConsumed} Kcal </Text>
                            </View>
                            <View style={styles.modalInfoBox}>
                                <Text style={styles.modalInfoLabel}>Gasto </Text>
                                <Text style={[styles.modalInfoValue, { color: '#e74c3c' }]}>{modalSpent} Kcal </Text>
                            </View>
                            <View style={styles.modalInfoBox}>
                                <Text style={styles.modalInfoLabel}>Balanço </Text>
                                <Text style={[styles.modalInfoValue, { color: modalBalanceColor }]}>{modalNetBalance > 0 ? '+' : ''}{modalNetBalance} Kcal </Text>
                            </View>
                        </View>
                        
                        {hasConfiguredSupplements && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Suplementos </Text>
                                {supplements.map(supplement => {
                                    const value = supplementsOnSelectedDay[supplement.id] ?? (supplement.trackingType === 'daily_check' ? false : 0);
                                    const isTaken = value === true;
                                    const count = typeof value === 'number' ? value : 0;

                                    return (
                                        <View key={supplement.id} style={styles.supplementItem}>
                                            <Text style={styles.supplementName}>{supplement.name} </Text>
                                            
                                            {supplement.trackingType === 'daily_check' ? (
                                                <View style={styles.statusContainer}>
                                                    <Ionicons name={isTaken ? "checkmark-circle" : "close-circle"} size={20} color={isTaken ? "#2ecc71" : "#e74c3c"} />
                                                    <Text style={[styles.supplementStatus, { color: isTaken ? '#2ecc71' : '#e74c3c' }]}>{isTaken ? 'Tomado' : 'Não Tomado'} </Text>
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
                            <Text style={styles.sectionTitle}>Atividades Físicas </Text>
                            <FlatList
                                data={selectedDayActivities}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={<Text style={styles.noActivityText}>Nenhuma atividade registada.</Text>}
                                renderItem={({ item }) => {
                                    const workoutName = item.details?.type ? (workouts[item.details.type]?.name || item.details.type) : '';
                                    const activityName = item.category === 'Musculação' ? `Musculação (${workoutName})` : item.category;
                                    const duration = item.details?.duration;
                                    const isSwimmingWithDistance = (item.category || '').toLowerCase() === 'natação' && item.details?.distance > 0;
                                    const activityDetailString = (
                                        (isSwimmingWithDistance ? `${item.details.distance} m / ` : '') +
                                        (duration ? `${duration} min` : '')
                                    ).trim();
                                    
                                    return (
                                        <Pressable style={styles.activityItem} onPress={editMode ? () => handleDeleteActivity(item.id) : undefined}>
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityName} numberOfLines={1}>{activityName} </Text>
                                            </View>
                                            {activityDetailString ? <Text style={styles.activityDetail}>{activityDetailString} </Text> : null}
                                            {editMode && <Ionicons name="trash-outline" size={24} color="#e74c3c" style={{ marginLeft: 15 }} />}
                                        </Pressable>
                                    );
                                }}
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

            <Modal animationType="slide" transparent={true} visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}>
                <Pressable style={styles.modalContainer} onPress={() => setIsAddModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Atividade em {selectedDay} </Text>
                        <FlatList
                            data={activityOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                if (item.isSport === 'divider') {
                                    return <Text style={styles.dividerText}>{item.name} </Text>;
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
    calendar: { margin: 10, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    loadingBalanceContainer: { padding: 30, justifyContent: 'center', alignItems: 'center' },
    loadingBalanceText: { color: 'gray', fontSize: 14, marginTop: 8 },
    editModeBanner: { textAlign: 'center', color: '#c0392b', fontWeight: 'bold', padding: 10, backgroundColor: '#ffdddd' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%'},
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, textAlign: 'center' },
    modalBalanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    modalInfoBox: { alignItems: 'center', flex: 1 },
    modalInfoLabel: { fontSize: 14, color: 'gray' },
    modalInfoValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
    supplementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    supplementName: { fontSize: 16, color: '#333' },
    supplementStatus: { fontSize: 16, fontWeight: '500', marginLeft: 5 },
    supplementStatusValue: { fontSize: 16, fontWeight: 'bold', color: themeColor },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    activityInfo: { flex: 1, marginRight: 10 },
    activityName: { fontSize: 16, color: '#333', fontWeight: '500', flexShrink: 1 },
    activityDetail: { fontSize: 14, color: 'gray', fontWeight: '500' }, 
    noActivityText: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 20 },
    closeButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
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
    },
    addButton: { flexDirection: 'row', backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    dividerText: { fontSize: 16, fontWeight: 'bold', color: 'gray', marginVertical: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    optionButton: { backgroundColor: '#f0f2f5', padding: 15, borderRadius: 10, marginBottom: 8 },
    optionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    optionButtonSubtitle: { fontSize: 12, color: 'gray', marginTop: 4 },
    calorieSummaryContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        marginHorizontal: 10,
        marginBottom: 15,
        elevation: 2,
    },
    calorieRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    calorieLabel: {
        fontSize: 16,
        color: '#333',
    },
    calorieValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    netBalanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    netBalanceLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    netBalanceValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});