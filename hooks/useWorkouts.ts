// hooks/useWorkouts.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORKOUT_DATA, Workout, Exercise } from '../constants/workoutData';

const WORKOUTS_STORAGE_KEY = 'user_workouts_storage';

export function useWorkouts() {
    const [workouts, setWorkouts] = useState<Record<string, Workout>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkouts = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedWorkouts = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
            if (storedWorkouts) {
                setWorkouts(JSON.parse(storedWorkouts));
            } else {
                setWorkouts(WORKOUT_DATA);
                await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(WORKOUT_DATA));
            }
        } catch (e) {
            console.error("Falha ao carregar os treinos.", e);
            setWorkouts(WORKOUT_DATA);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWorkouts();
    }, [loadWorkouts]);

    const saveWorkouts = async (newWorkouts: Record<string, Workout>) => {
        try {
            await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(newWorkouts));
            setWorkouts(newWorkouts);
        } catch (e) {
            console.error("Falha ao guardar os treinos.", e);
        }
    };

    const addExercise = async (workoutId: string, newExercise: Exercise) => {
        const newWorkouts = { ...workouts };
        if (newWorkouts[workoutId]) {
            newWorkouts[workoutId].exercises.push(newExercise);
            await saveWorkouts(newWorkouts);
        }
    };

    const updateExercise = async (workoutId: string, updatedExercise: Exercise) => {
        const newWorkouts = { ...workouts };
        if (newWorkouts[workoutId]) {
            const index = newWorkouts[workoutId].exercises.findIndex(ex => ex.id === updatedExercise.id);
            if (index > -1) {
                newWorkouts[workoutId].exercises[index] = updatedExercise;
                await saveWorkouts(newWorkouts);
            }
        }
    };

    const deleteExercise = async (workoutId: string, exerciseId: string) => {
        const newWorkouts = { ...workouts };
        if (newWorkouts[workoutId]) {
            newWorkouts[workoutId].exercises = newWorkouts[workoutId].exercises.filter(ex => ex.id !== exerciseId);
            await saveWorkouts(newWorkouts);
        }
    };
    
    const reorderExercises = async (workoutId: string, reorderedExercises: Exercise[]) => {
        const newWorkouts = { ...workouts };
        if (newWorkouts[workoutId]) {
            newWorkouts[workoutId].exercises = reorderedExercises;
            await saveWorkouts(newWorkouts);
        }
    };

    // NOVA FUNÇÃO para adicionar uma ficha de treino
    const addWorkout = async (name: string, groups: string) => {
        const newWorkouts = { ...workouts };
        const newWorkoutId = `workout_${Date.now()}`;
        const newWorkout: Workout = {
            id: newWorkoutId,
            name: name,
            groups: groups,
            exercises: [],
        };
        newWorkouts[newWorkoutId] = newWorkout;
        await saveWorkouts(newWorkouts);
    };

    // NOVA FUNÇÃO para apagar uma ficha de treino
    const deleteWorkout = async (workoutId: string) => {
        const newWorkouts = { ...workouts };
        delete newWorkouts[workoutId];
        await saveWorkouts(newWorkouts);
    };

    return { workouts, isLoading, refreshWorkouts: loadWorkouts, addExercise, updateExercise, deleteExercise, reorderExercises, addWorkout, deleteWorkout };
}

