// app/(tabs)/esportes.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link, Stack, Href, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSportsContext } from '../../context/SportsProvider';

const themeColor = '#5a4fcf';

const MonthlyActivitySummary = ({ history, sportName }: { history: any[], sportName: string }) => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const currentMonth = new Date().getMonth();
    const categoryToFilter = sportName === 'Academia' ? 'Musculação' : sportName;

    const monthlySportHistory = history.filter(entry => {
        const entryDate = new Date(entry.date);
        const adjustedEntryDate = new Date(entryDate.valueOf() + entryDate.getTimezoneOffset() * 60 * 1000);
        return entry.category === categoryToFilter && adjustedEntryDate.getMonth() === currentMonth;
    });

    monthlySportHistory.forEach(entry => {
        const entryDate = new Date(entry.date);
        const adjustedEntryDate = new Date(entryDate.valueOf() + entryDate.getTimezoneOffset() * 60 * 1000);
        const dayIndex = adjustedEntryDate.getDay();
        dayCounts[dayIndex]++;
    });

    return (
        <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumo Mensal</Text>
            <View style={styles.summaryGrid}>
                {daysOfWeek.map((day, index) => (
                    <View key={day} style={styles.dayColumn}>
                        <Text style={styles.dayCount}>{dayCounts[index]}</Text>
                        <Text style={styles.dayLabel}>{day}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function SportsScreen() {
    const { sports, isLoading: isLoadingSports } = useSportsContext();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    useFocusEffect(
      useCallback(() => {
        const loadHistory = async () => {
          setIsLoadingHistory(true);
          const historyJSON = await AsyncStorage.getItem('workoutHistory');
          setHistory(historyJSON ? JSON.parse(historyJSON) : []);
          setIsLoadingHistory(false);
        };
        loadHistory();
      }, [])
    );

    const isLoading = isLoadingSports || isLoadingHistory;

    if (isLoading) {
        return (
            <View style={styles.container}>
                 <Stack.Screen options={{ headerShown: true, title: "Esportes", headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }} />
                <ActivityIndicator size="large" color={themeColor} style={{ marginTop: 30 }}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen 
              options={{ 
                headerShown: true, 
                title: "Esportes", 
                headerStyle: { backgroundColor: themeColor }, 
                headerTintColor: '#fff' 
              }} 
            />
            <FlatList
                data={sports}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item }) => {
                    const href: Href = item.name === 'Academia' 
                        ? { pathname: '/musculacao' } 
                        : { pathname: '/logEsporte', params: { esporte: item.name } };

                    const IconComponent = item.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

                    return (
                        <Link href={href} asChild>
                            <Pressable style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <IconComponent name={item.icon as any} size={32} color={themeColor} />
                                    <View style={styles.cardTextContainer}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
                                </View>
                                <MonthlyActivitySummary history={history} sportName={item.name} />
                            </Pressable>
                        </Link>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
    cardTextContainer: { flex: 1, marginLeft: 15, },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', },
    summaryContainer: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', },
    summaryTitle: { textAlign: 'center', color: 'gray', marginBottom: 15, fontWeight: '600', },
    summaryGrid: { flexDirection: 'row', justifyContent: 'space-around', },
    dayColumn: { alignItems: 'center', },
    dayCount: { fontSize: 18, fontWeight: 'bold', color: themeColor, marginBottom: 4, },
    dayLabel: { fontSize: 12, color: 'gray', }
});