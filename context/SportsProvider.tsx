// context/SportsProvider.tsx

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconInfo } from '../constants/iconList';

export interface Sport {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    library: 'Ionicons' | 'MaterialCommunityIcons';
}

interface SportsContextType {
    sports: Sport[];
    isLoading: boolean;
    addSport: (name: string, icon: IconInfo) => Promise<void>;
    deleteSport: (sportId: string) => Promise<void>;
}

const SPORTS_STORAGE_KEY = 'user_sports_list';

const INITIAL_SPORTS_DATA: Sport[] = [
    { id: 'academia', name: 'Academia', icon: 'barbell-outline', library: 'Ionicons' },
    { id: 'volei_quadra', name: 'Vôlei de Quadra', icon: 'volleyball', library: 'MaterialCommunityIcons' },
    { id: 'volei_praia', name: 'Vôlei de Praia', icon: 'sunny-outline', library: 'Ionicons' },
    { id: 'futebol', name: 'Futebol Society', icon: 'football-outline', library: 'Ionicons' },
    { id: 'boxe', name: 'Boxe', icon: 'boxing-glove', library: 'MaterialCommunityIcons' },
];

const SportsContext = createContext<SportsContextType | undefined>(undefined);

export function SportsProvider({ children }: { children: ReactNode }) {
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSports = async () => {
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
        };
        loadSports();
    }, []);

    const saveSports = async (newSports: Sport[]) => {
        try {
            await AsyncStorage.setItem(SPORTS_STORAGE_KEY, JSON.stringify(newSports));
            setSports(newSports); // Atualiza o estado global
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
        if (sportId === 'academia') {
            alert('A "Academia" não pode ser removida.');
            return;
        }
        const updatedSports = sports.filter(sport => sport.id !== sportId);
        await saveSports(updatedSports);
    };

    return (
        <SportsContext.Provider value={{ sports, isLoading, addSport, deleteSport }}>
            {children}
        </SportsContext.Provider>
    );
}

// Hook personalizado para consumir o contexto facilmente
export function useSportsContext() {
    const context = useContext(SportsContext);
    if (context === undefined) {
        throw new Error('useSportsContext must be used within a SportsProvider');
    }
    return context;
}