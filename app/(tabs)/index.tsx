// app/(tabs)/index.tsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar, ScrollView, Modal, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { scheduleNextReminder } from '../../lib/notificationService';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useSportsContext } from '../../context/SportsProvider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ShareCard from '../../components/ShareCard';
import Toast from 'react-native-toast-message';

const themeColor = '#5a4fcf';

const CREATINE_HISTORY_KEY = 'creatineHistory';
const WHEY_HISTORY_KEY = 'wheyHistory';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
};

const WeeklySummaryGraph = ({ data, iconMap }: { data: { [key: string]: number }, iconMap: any }) => {
    const activities = Object.entries(data);

    if (activities.length === 0) {
        return (
            <View style={styles.graphContainer}>
                <Text style={styles.graphTitle}>Resumo da Semana </Text>
                <Text style={styles.noActivityText}>Nenhuma atividade registada esta semana. </Text>
            </View>
        );
    }
    const maxCount = Math.max(...activities.map(([, count]) => count), 1);
    
    return (
        <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Resumo da Semana </Text>
            <View style={styles.barGraphContainer}>
                {activities.map(([category, count]) => {
                    const iconInfo = iconMap[category];
                    const IconComponent = iconInfo?.library === 'MaterialCommunityIcons' 
                        ? MaterialCommunityIcons 
                        : Ionicons;

                    return (
                        <View key={category} style={styles.barWrapper}>
                            <View style={styles.barItem}>
                                <Text style={styles.barLabelCount}>{count}x</Text>
                                <View style={[styles.bar, { height: `${(count / maxCount) * 100}%` }]} />
                            </View>
                            {iconInfo ? (
                                <IconComponent name={iconInfo.name as any} size={28} color={themeColor} style={styles.barLabelIcon} />
                            ) : (
                                <Ionicons name="help-circle-outline" size={28} color="gray" style={styles.barLabelIcon} />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};


export default function HomeScreen() {
    const { workouts, isLoading: isLoadingWorkouts, refreshWorkouts } = useWorkouts();
    const { sports } = useSportsContext(); // ALTERADO
    const [userName, setUserName] = useState('Utilizador');
    const [weeklyGymWorkouts, setWeeklyGymWorkouts] = useState(0);
    const [creatineTaken, setCreatineTaken] = useState(false);
    const [wheyCount, setWheyCount] = useState(0);
    const [weeklySummary, setWeeklySummary] = useState<{ [key: string]: number }>({});
    const [nextWorkoutId, setNextWorkoutId] = useState('A');
    const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [todayActivities, setTodayActivities] = useState<any[]>([]);

    const viewShotRef = useRef<ViewShot>(null);
    const isFocused = useIsFocused();
    // NOVO: Ref para controlar se o toast de boas-vindas já foi exibido
    const welcomeToastShown = useRef(false);
    
    const sportIconMap = useMemo(() => {
        const map: Record<string, { name: string; library: string }> = {};
        sports.forEach(sport => {
            const key = sport.name === 'Academia' ? 'Musculação' : sport.name;
            map[key] = { name: sport.icon as string, library: sport.library };
        });
        return map;
    }, [sports]);

    const loadData = useCallback(async () => {
        const today = getLocalDateString();
        try {
            const profileJSON = await AsyncStorage.getItem('userProfile');
            if (profileJSON) {
                const { name } = JSON.parse(profileJSON);
                setUserName(name || 'Utilizador');
            }

            const creatineHistoryJSON = await AsyncStorage.getItem(CREATINE_HISTORY_KEY);
            const creatineHistory = creatineHistoryJSON ? JSON.parse(creatineHistoryJSON) : {};
            setCreatineTaken(!!creatineHistory[today]);

            const wheyHistoryJSON = await AsyncStorage.getItem(WHEY_HISTORY_KEY);
            const wheyHistory = wheyHistoryJSON ? JSON.parse(wheyHistoryJSON) : {};
            setWheyCount(wheyHistory[today] || 0);

            const workoutHistoryJSON = await AsyncStorage.getItem('workoutHistory');
            if (workoutHistoryJSON) {
                const history: { date: string, category: string, details: { calories?: number, type?: string, duration?: number } }[] = JSON.parse(workoutHistoryJSON);
                
                const startOfWeekString = getLocalDateString(getStartOfWeek());
                const weeklyHistory = history.filter(entry => entry.date >= startOfWeekString);
                
                const gymWorkoutsThisWeek = weeklyHistory.filter(entry => entry.category === 'Musculação');
                setWeeklyGymWorkouts(gymWorkoutsThisWeek.length);
                
                const summary = weeklyHistory.reduce((acc, entry) => {
                    const category = entry.category || 'Outro';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {} as { [key: string]: number });
                setWeeklySummary(summary);

                const activitiesToday = history.filter(entry => entry.date === today);
                setTodayActivities(activitiesToday);

                const totalKcal = activitiesToday.reduce((sum, entry) => sum + (entry.details?.calories || 0), 0);
                setTotalCaloriesToday(totalKcal);

            } else {
                setWeeklyGymWorkouts(0);
                setWeeklySummary({});
                setTotalCaloriesToday(0);
                setTodayActivities([]);
            }

            const savedNextWorkoutId = await AsyncStorage.getItem('nextWorkoutId');
            setNextWorkoutId(savedNextWorkoutId || 'A');

        } catch (e) {
            console.error("Failed to load data.", e);
        }
    }, []);
    
    useEffect(() => {
        if (isFocused) {
            loadData();
            refreshWorkouts();
            if (typeof scheduleNextReminder === 'function') {
                scheduleNextReminder();
            }
        }
    }, [isFocused, loadData, refreshWorkouts]);

    // NOVO: useEffect para exibir o Toast de Boas-Vindas
    useEffect(() => {
        // Garante que o toast só aparece uma vez por sessão,
        // quando o ecrã está focado e o nome do utilizador já foi carregado.
        if (isFocused && !welcomeToastShown.current && userName !== 'Utilizador') {
            Toast.show({
                type: 'info',
                text1: `Bem-vindo de volta, ${userName}!`,
                text2: 'Pronto para esmagar os seus objetivos hoje? 💪',
                visibilityTime: 4000 // Duração de 4 segundos
            });
            welcomeToastShown.current = true; // Marca o toast como exibido para esta sessão
        }
    }, [isFocused, userName]); // Depende do foco e do nome do utilizador

    const handleCreatinePress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const today = getLocalDateString();
        const newStatus = !creatineTaken;
        setCreatineTaken(newStatus);
        
        try {
            const historyJSON = await AsyncStorage.getItem(CREATINE_HISTORY_KEY);
            const history = historyJSON ? JSON.parse(historyJSON) : {};

            if (newStatus) {
                history[today] = true;
                Toast.show({ type: 'success', text1: 'Creatina registada!', text2: 'Bom trabalho, mantenha a consistência.' });
            } else {
                delete history[today];
                Toast.show({ type: 'info', text1: 'Registo da creatina removido.' });
            }
            
            await AsyncStorage.setItem(CREATINE_HISTORY_KEY, JSON.stringify(history));
            
            if (typeof scheduleNextReminder === 'function') {
                await scheduleNextReminder();
            }
        } catch (e) { 
            console.error("Failed to save creatine history.", e); 
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível guardar o registo.' });
        }
    };

    const updateWheyCount = async (newCount: number) => {
        if (newCount < 0) return;

        const oldCount = wheyCount;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setWheyCount(newCount);
        const today = getLocalDateString();

        try {
            const historyJSON = await AsyncStorage.getItem(WHEY_HISTORY_KEY);
            const history = historyJSON ? JSON.parse(historyJSON) : {};

            if (newCount > 0) {
                history[today] = newCount;
            } else {
                delete history[today];
            }

            await AsyncStorage.setItem(WHEY_HISTORY_KEY, JSON.stringify(history));

            if (newCount > oldCount) {
                Toast.show({ type: 'success', text1: `Dose de Whey Adicionada (${newCount})` });
            } else if (newCount < oldCount) {
                Toast.show({ type: 'info', text1: `Dose de Whey Removida (${newCount})` });
            }

        } catch (e) { 
            console.error("Failed to save whey history.", e);
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível guardar o registo de whey.' });
        }
    };

    const handleWheyIncrement = () => updateWheyCount(wheyCount + 1);
    const handleWheyDecrement = () => updateWheyCount(wheyCount - 1);
    
    const handleShare = async () => {
        if (viewShotRef.current?.capture) {
            try {
                const uri = await viewShotRef.current.capture();
                if (!(await Sharing.isAvailableAsync())) {
                    Alert.alert("Erro", "A partilha não está disponível neste dispositivo.");
                    return;
                }
                await Sharing.shareAsync(uri);
            } catch (error) {
                console.error("Erro ao partilhar:", error);
                Alert.alert("Erro", "Não foi possível partilhar a imagem.");
            }
        }
    };

    const nextWorkoutName = isLoadingWorkouts ? 'A carregar...' : (workouts[nextWorkoutId]?.name || 'Treino');
    const totalDurationToday = todayActivities.reduce((sum, entry) => sum + (entry.details?.duration || (entry.category === 'Musculação' ? 60 : 0)), 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />
            <ScrollView>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingSmall}>Olá,</Text>
                        <Text style={styles.greetingLarge}>{userName} </Text>
                    </View>
                    <Text style={styles.workoutCount}>{`Acad. na semana: ${weeklyGymWorkouts}`} </Text>
                </View>

                <View style={styles.content}>
                    <Pressable style={styles.card} onPress={() => setIsDetailsModalVisible(true)}>
                        <View>
                            <Text style={styles.cardTitle}>Gasto Calórico </Text>
                            <Text style={styles.cardDose}>Estimativa de hoje </Text>
                        </View>
                        <View style={styles.caloriesDisplay}>
                            <Text style={styles.caloriesValue}>{totalCaloriesToday} </Text>
                            <Text style={styles.caloriesUnit}>kcal </Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.card} onPress={handleCreatinePress}>
                        <View>
                            <Text style={styles.cardTitle}>Creatina </Text>
                            <Text style={styles.cardDose}>Dose: 6g </Text>
                        </View>
                        <Text style={[styles.statusIcon, { color: creatineTaken ? 'green' : 'red' }]}>
                            {creatineTaken ? '✔' : '❌'}
                        </Text>
                    </Pressable>
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.cardTitle}>Whey </Text>
                            <Text style={styles.cardDose}>Dose: 30g </Text>
                        </View>
                        <View style={styles.wheyCounter}>
                            <Pressable onPress={handleWheyDecrement} style={styles.wheyButton}>
                                <Text style={styles.wheyArrow}>{'<'}</Text>
                            </Pressable>
                            <Text style={styles.wheyCountText}>{wheyCount}</Text>
                            <Pressable onPress={handleWheyIncrement} style={styles.wheyButton}>
                                <Text style={styles.wheyArrow}>{'>'}</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{nextWorkoutName} </Text>
                        <Link 
                            href={{
                                pathname: "/fichas/[id]",
                                params: { id: nextWorkoutId, title: nextWorkoutName }
                            }} 
                            asChild
                        >
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>Abrir ficha </Text>
                            </Pressable>
                        </Link>
                    </View>

                    <WeeklySummaryGraph data={weeklySummary} iconMap={sportIconMap} />
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isDetailsModalVisible}
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={{ position: 'absolute', top: -10000 }}>
                    <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                        <ShareCard 
                            activities={todayActivities} 
                            totalKcal={totalCaloriesToday}
                            totalDuration={totalDurationToday}
                            date={new Date()}
                            workouts={workouts}
                        />
                    </ViewShot>
                </View>

                <Pressable style={styles.modalContainer} onPress={() => setIsDetailsModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Detalhes do Gasto Calórico de Hoje </Text>
                        <FlatList
                            data={todayActivities}
                            keyExtractor={(item, index) => `${item.category}-${index}`}
                            renderItem={({ item }) => {
                                let activityDisplayName = item.category;
                                if (item.category === 'Musculação' && item.details?.type) {
                                    const workoutName = workouts && workouts[item.details.type] ? workouts[item.details.type].name : item.details.type;
                                    activityDisplayName = `Musculação (${workoutName})`;
                                }
                                return (
                                    <View style={styles.activityItem}>
                                        <Text style={styles.activityName}>{activityDisplayName} </Text>
                                        <Text style={styles.activityCalories}>{item.details?.calories || 0} kcal </Text>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text style={styles.noActivityTextModal}>Nenhuma atividade registada. </Text>}
                        />
                        <View style={styles.modalFooter}>
                            {todayActivities.length > 0 && (
                                <Pressable style={styles.shareButton} onPress={handleShare}>
                                    <Ionicons name="share-social-outline" size={20} color={themeColor} />
                                    <Text style={styles.shareButtonText}>Compartilhar </Text>
                                </Pressable>
                            )}
                            <Pressable style={styles.closeButton} onPress={() => setIsDetailsModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Fechar </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: themeColor, paddingHorizontal: 25, paddingTop: 80, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    greetingSmall: { fontSize: 22, color: 'white', opacity: 0.8 },
    greetingLarge: { fontSize: 36, fontWeight: 'bold', color: 'white' },
    workoutCount: { fontSize: 16, color: 'white', fontWeight: '500', textAlign: 'right' },
    content: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 25, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, height: 95 },
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    cardDose: { fontSize: 14, color: 'gray', marginTop: 5 },
    statusIcon: { fontSize: 30 },
    wheyCounter: { flexDirection: 'row', alignItems: 'center' },
    wheyCountText: { fontSize: 28, fontWeight: 'bold', color: '#333', width: 40, textAlign: 'center' },
    wheyArrow: { fontSize: 24, color: 'gray' },
    wheyButton: { paddingHorizontal: 10 },
    button: { backgroundColor: themeColor, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
    buttonText: { color: 'white', fontWeight: 'bold' },
    graphContainer: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    graphTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    noActivityText: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 40, },
    barGraphContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, marginTop: 10, },
    barWrapper: { alignItems: 'center', flex: 1, marginHorizontal: 5, },
    barItem: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', },
    bar: { width: 35, backgroundColor: themeColor, borderRadius: 5, },
    barLabelCount: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, },
    barLabelIcon: { marginTop: 8, },
    caloriesDisplay: { alignItems: 'flex-end', },
    caloriesValue: { fontSize: 28, fontWeight: 'bold', color: themeColor, },
    caloriesUnit: { fontSize: 14, color: 'gray', },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', },
    modalContent: { backgroundColor: 'white', padding: 22, paddingBottom: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: '40%', maxHeight: '60%', },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', },
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
    activityName: { fontSize: 16, color: '#333', },
    activityCalories: { fontSize: 16, fontWeight: 'bold', color: themeColor, },
    noActivityTextModal: { textAlign: 'center', color: 'gray', fontSize: 16, paddingVertical: 20, },
    modalFooter: { marginTop: 20, },
    shareButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 10, padding: 15, marginBottom: 10, },
    shareButtonText: { color: themeColor, fontSize: 16, fontWeight: 'bold', marginLeft: 10, },
    closeButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
});