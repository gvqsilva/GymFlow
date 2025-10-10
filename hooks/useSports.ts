// hooks/useSports.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconInfo } from '../constants/iconList';

export interface Sport {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    library: 'Ionicons' | 'MaterialCommunityIcons';
}

const SPORTS_STORAGE_KEY = 'user_sports_list';

// Dados iniciais SEM "Natação"
const INITIAL_SPORTS_DATA: Sport[] = [
    { id: 'academia', name: 'Academia', icon: 'barbell-outline', library: 'Ionicons' },
    { id: 'volei_quadra', name: 'Vôlei de Quadra', icon: 'volleyball', library: 'MaterialCommunityIcons' },
    { id: 'volei_praia', name: 'Vôlei de Praia', icon: 'sunny-outline', library: 'Ionicons' },
    { id: 'futebol', name: 'Futebol Society', icon: 'football-outline', library: 'Ionicons' },
    { id: 'boxe', name: 'Boxe', icon: 'boxing-glove', library: 'MaterialCommunityIcons' },
];

export function useSports() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSports = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedSports = await AsyncStorage.getItem(SPORTS_STORAGE_KEY);
            if (storedSports) {
                setSports(JSON.parse(storedSports));
            } else {
                setSports(INITIAL_SPORTS_DATA);
                await AsyncStorage.setItem(SPORTS_STORAGE_KEY, JSON.stringify(INITIAL_SPORTS_DATA));
            }
        } catch (e) {
            console.error("Falha ao carregar os desportos.", e);
            setSports(INITIAL_SPORTS_DATA);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSports();
    }, [loadSports]);

    const saveSports = async (newSports: Sport[]) => {
        try {
            await AsyncStorage.setItem(SPORTS_STORAGE_KEY, JSON.stringify(newSports));
            setSports(newSports);
        } catch (e) {
            console.error("Falha ao guardar os desportos.", e);
        }
    };

    const addSport = async (name: string, icon: IconInfo) => {
        if (!name.trim()) return;

        const newSport: Sport = {
            id: `sport_${Date.now()}`,
            name: name.trim(),
            icon: icon.name as any,
            library: icon.library,
        };
        
        const updatedSports = [...sports, newSport];
        await saveSports(updatedSports);
    };

    const deleteSport = async (sportId: string) => {
        // Apenas "Academia" não pode ser removida.
        if (sportId === 'academia') {
            alert('A "Academia" não pode ser removida.');
            return;
        }
        const updatedSports = sports.filter(sport => sport.id !== sportId);
        await saveSports(updatedSports);
    };

    return { sports, isLoading, addSport, deleteSport, refreshSports: loadSports };
}