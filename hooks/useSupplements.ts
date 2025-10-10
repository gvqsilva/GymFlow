// hooks/useSupplements.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TrackingType = 'daily_check' | 'counter';

export interface Supplement {
    id: string;
    name: string;
    dose: number;
    unit: string; // ex: 'g', 'mg', 'scoop', 'cápsula'
    trackingType: TrackingType;
}

const SUPPLEMENTS_STORAGE_KEY = 'user_supplements_list';

// Dados iniciais para o utilizador começar
const INITIAL_SUPPLEMENTS_DATA: Supplement[] = [
    { id: 'supp_creatine', name: 'Creatina', dose: 6, unit: 'g', trackingType: 'daily_check' },
    { id: 'supp_whey', name: 'Whey Protein', dose: 30, unit: 'g', trackingType: 'counter' },
];

export function useSupplements() {
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSupplements = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedData = await AsyncStorage.getItem(SUPPLEMENTS_STORAGE_KEY);
            if (storedData) {
                setSupplements(JSON.parse(storedData));
            } else {
                setSupplements(INITIAL_SUPPLEMENTS_DATA);
                await AsyncStorage.setItem(SUPPLEMENTS_STORAGE_KEY, JSON.stringify(INITIAL_SUPPLEMENTS_DATA));
            }
        } catch (e) {
            console.error("Falha ao carregar os suplementos.", e);
            setSupplements(INITIAL_SUPPLEMENTS_DATA);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSupplements();
    }, [loadSupplements]);

    const saveSupplements = async (newSupplements: Supplement[]) => {
        try {
            await AsyncStorage.setItem(SUPPLEMENTS_STORAGE_KEY, JSON.stringify(newSupplements));
            setSupplements(newSupplements);
        } catch (e) {
            console.error("Falha ao guardar os suplementos.", e);
        }
    };

    const addSupplement = async (supplement: Omit<Supplement, 'id'>) => {
        const newSupplement: Supplement = { ...supplement, id: `supp_${Date.now()}` };
        const updatedSupplements = [...supplements, newSupplement];
        await saveSupplements(updatedSupplements);
    };

    const updateSupplement = async (updatedSupplement: Supplement) => {
        const updatedSupplements = supplements.map(s => s.id === updatedSupplement.id ? updatedSupplement : s);
        await saveSupplements(updatedSupplements);
    };

    const deleteSupplement = async (supplementId: string) => {
        const updatedSupplements = supplements.filter(s => s.id !== supplementId);
        await saveSupplements(updatedSupplements);
    };

    return { supplements, isLoading, addSupplement, updateSupplement, deleteSupplement, refreshSupplements: loadSupplements };
}