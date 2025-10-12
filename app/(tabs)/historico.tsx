// app/(tabs)/historico.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// 🟢 Importa a base de dados local
import FoodDatabase from '../../data/foodData.json';

const themeColor = '#5a4fcf';

// --- INTERFACES E TIPOS ---
type MealType = 'Café' | 'Almoço' | 'Jantar' | 'Lanche';
const MEAL_TYPES: MealType[] = ['Café', 'Almoço', 'Jantar', 'Lanche'];

interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit_g_conversion?: number;
}

interface FoodEntry {
  id: string;
  date: string;
  mealType: MealType;
  description: string;
  data: NutritionResult;
}

interface GroupedMealData {
  mealType: MealType;
  totalCalories: number;
  items: FoodEntry[];
}

// --- FUNÇÕES AUXILIARES ---
const getLocalDateString = (date = new Date()) => date.toISOString().split('T')[0];

const ResultMacroText = ({
  label,
  value,
  unit,
  emoji,
}: {
  label: string;
  value: number | undefined | null;
  unit: string;
  emoji: string;
}) => (
  <View style={styles.macroRow}>
    <Text style={styles.macroLabel}>
      <Text style={styles.macroEmoji}>{emoji} </Text>
      <Text style={styles.macroTextBold}>{label}:</Text>
    </Text>
    <Text style={styles.macroValue}>{value || 0} {unit}</Text>
  </View>
);

const processDailyData = (entries: FoodEntry[], today: string) => {
  const todayEntries = entries.filter(entry => entry.date === today);
  let totalCalories = 0;

  const mealMap = new Map<MealType, GroupedMealData>();
  MEAL_TYPES.forEach(type => mealMap.set(type, { mealType: type, totalCalories: 0, items: [] }));

  todayEntries.forEach(entry => {
    totalCalories += entry.data.calories;
    const mealData = mealMap.get(entry.mealType);
    if (mealData) {
      mealData.totalCalories += entry.data.calories;
      mealData.items.push(entry);
    }
  });

  const groupedMeals = Array.from(mealMap.values()).filter(m => m.items.length > 0);

  return { totalCalories: Math.round(totalCalories), groupedMeals };
};

const getDailySummary = async (
  setDailyTotalCalories: React.Dispatch<React.SetStateAction<number>>,
  setDailyMealsData: React.Dispatch<React.SetStateAction<GroupedMealData[]>>
) => {
  try {
    const today = getLocalDateString();
    const existingEntriesJSON = await AsyncStorage.getItem('foodHistory');
    const existingEntries: FoodEntry[] = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
    const { totalCalories, groupedMeals } = processDailyData(existingEntries, today);
    setDailyTotalCalories(totalCalories);
    setDailyMealsData(groupedMeals);
  } catch (e) {
    console.error('Erro ao carregar resumo diário', e);
    Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar histórico.', position: 'bottom' });
  }
};

// --- COMPONENTE DE DETALHES ---
const MealDetail = ({ mealData }: { mealData: GroupedMealData | undefined }) => {
  if (!mealData || mealData.items.length === 0) {
    return <Text style={styles.noItemsText}>Nenhum item registrado para esta refeição hoje.</Text>;
  }

  return (
    <View style={styles.mealDetailContainer}>
      <Text style={styles.mealDetailTitleText}>
        Detalhes de {mealData.mealType} ({mealData.totalCalories} Kcal)
      </Text>

      {mealData.items.map(item => (
        <View key={item.id} style={styles.mealItemBox}>
          <Text style={styles.mealItemDescription}>{item.description}</Text>
          <View style={styles.mealItemMacros}>
            <Text style={styles.mealItemCalorieText}>{item.data.calories} Kcal</Text>
            <Text style={styles.mealItemMacroText}>P: {item.data.protein}g</Text>
            <Text style={styles.mealItemMacroText}>C: {item.data.carbs}g</Text>
            <Text style={styles.mealItemMacroText}>G: {item.data.fat}g</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function HistoricoScreen() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<NutritionResult | null>(null);
  const [dailyTotalCalories, setDailyTotalCalories] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Café');
  const [dailyMealsData, setDailyMealsData] = useState<GroupedMealData[]>([]);
  const [viewingMeal, setViewingMeal] = useState<MealType>('Café');

  const loadDailySummary = useCallback(async () => {
    await getDailySummary(setDailyTotalCalories, setDailyMealsData);
  }, []);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

  // --- SALVAR ENTRADA ---
  const saveFoodEntry = async (description: string, result: NutritionResult, mealType: MealType) => {
    try {
      const today = getLocalDateString();
      const newEntry: FoodEntry = {
        id: `food_${Date.now()}_${Math.random()}`,
        date: today,
        mealType,
        description,
        data: result,
      };

      const existingEntriesJSON = await AsyncStorage.getItem('foodHistory');
      const existingEntries: FoodEntry[] = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
      existingEntries.unshift(newEntry);

      await AsyncStorage.setItem('foodHistory', JSON.stringify(existingEntries));
    } catch (e) {
      console.error('Erro ao salvar histórico', e);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar entrada.', position: 'bottom' });
    }
  };

  // --- BUSCA ---
  const cleanNameForSearch = (name: string) => name.toUpperCase().replace(/[^A-Z]/g, '');

  const handleSearch = async () => {
    if (!query.trim()) {
      Toast.show({ type: 'info', text1: 'Atenção', text2: 'Digite quantidade e alimento (ex: 200g Arroz).', position: 'bottom' });
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    const quantityMatch = query.trim().match(/(\d+)\s*(g|ml)/i);
    const quantityInGrams = quantityMatch ? parseFloat(quantityMatch[1]) : 100;

    const rawFoodName = query.replace(quantityMatch ? quantityMatch[0] : '', '').replace(/de\s*/i, '').trim();
    const finalSearchTerm = cleanNameForSearch(rawFoodName.length > 3 ? rawFoodName : query);

    const foundFood = (FoodDatabase as FoodItem[]).find(item =>
      cleanNameForSearch(item.name).includes(finalSearchTerm)
    );

    if (!foundFood) {
      Toast.show({ type: 'error', text1: 'Não encontrado', text2: `Alimento "${rawFoodName}" não encontrado.`, position: 'bottom' });
      setIsLoading(false);
      return;
    }

    const factor = quantityInGrams / 100;
    const result: NutritionResult = {
      calories: foundFood.calories * factor,
      protein: foundFood.protein * factor,
      carbs: foundFood.carbs * factor,
      fat: foundFood.fat * factor,
    };

    const finalResult: NutritionResult = {
      calories: Math.round(result.calories),
      protein: parseFloat(result.protein.toFixed(1)),
      carbs: parseFloat(result.carbs.toFixed(1)),
      fat: parseFloat(result.fat.toFixed(1)),
    };

    setLastResult(finalResult);
    await saveFoodEntry(query, finalResult, selectedMeal);
    await loadDailySummary();
    setViewingMeal(selectedMeal);

    Toast.show({ type: 'success', text1: 'Registrado', text2: `${finalResult.calories} Kcal em ${selectedMeal}`, position: 'bottom' });
    setQuery('');
    setIsLoading(false);
  };

  const currentMealDetails = dailyMealsData.find(m => m.mealType === viewingMeal);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Registrar Alimentação',
          headerStyle: { backgroundColor: themeColor },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        {/* --- RESUMO DIÁRIO --- */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Total Consumido Hoje</Text>
          <Text style={styles.summaryKcal}>{dailyTotalCalories} Kcal</Text>
        </View>

        {/* --- SELETOR DE REFEIÇÃO --- */}
        <Text style={styles.headerTitle}>Refeição para Registro</Text>
        <View style={styles.mealSelectorContainer}>
          {MEAL_TYPES.map(meal => (
            <Pressable
              key={meal}
              style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
              onPress={() => setSelectedMeal(meal)}
              disabled={isLoading}
            >
              <Text style={[styles.mealButtonText, selectedMeal === meal && styles.mealButtonTextActive]}>{meal}</Text>
            </Pressable>
          ))}
        </View>

        {/* --- INPUT E BOTÃO --- */}
        <Text style={[styles.headerTitle, { marginTop: 20 }]}>Adicionar Alimento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 200g Frango Grelhado"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          editable={!isLoading}
        />

        <Pressable
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Calcular e Registrar Refeição</Text>}
        </Pressable>

        {/* --- RESULTADOS --- */}
        <View style={styles.resultsContainer}>
          {lastResult ? (
            <View>
              <Text style={styles.resultTitle}>Análise Rápida</Text>
              <ResultMacroText emoji="⚡️" label="Calorias" value={lastResult.calories} unit="Kcal" />
              <ResultMacroText emoji="🥩" label="Proteína" value={lastResult.protein} unit="g" />
              <ResultMacroText emoji="🍚" label="Carboidratos" value={lastResult.carbs} unit="g" />
              <ResultMacroText emoji="🥑" label="Gordura" value={lastResult.fat} unit="g" />
            </View>
          ) : (
            <View>
              <Text style={styles.infoText}>A aplicação usa a base de dados local. {'\n'}</Text>
              <Text style={styles.infoTextBold}>Formato: [Quantidade em g/ml] [Nome do Alimento]</Text>
            </View>
          )}
        </View>

        {/* --- HISTÓRICO --- */}
        <Text style={[styles.headerTitle, { marginTop: 40 }]}>Histórico de Refeições</Text>
        <View style={styles.mealSelectorContainer}>
          {MEAL_TYPES.map(meal => {
            const mealData = dailyMealsData.find(m => m.mealType === meal);
            const totalKcal = mealData ? mealData.totalCalories : 0;
            return (
              <Pressable
                key={`view-${meal}`}
                style={[styles.viewMealButton, viewingMeal === meal && styles.viewMealButtonActive]}
                onPress={() => setViewingMeal(meal)}
              >
                <Text style={[styles.viewMealButtonText, viewingMeal === meal && styles.mealButtonTextActive]}>
                  {meal} ({totalKcal} Kcal)
                </Text>
              </Pressable>
            );
          })}
        </View>

        <MealDetail mealData={currentMealDetails} />
      </ScrollView>

      {/* --- TOAST --- */}
      <Toast />
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  searchButton: { backgroundColor: themeColor, borderRadius: 10, padding: 15, alignItems: 'center', justifyContent: 'center', height: 50, marginTop: 10 },
  searchButtonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  mealSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, padding: 5, borderWidth: 1, borderColor: '#ddd', flexWrap: 'wrap' },
  mealButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 2, minWidth: '22%' },
  mealButtonActive: { backgroundColor: themeColor, shadowColor: themeColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  viewMealButton: { width: '48%', paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginVertical: 3, marginHorizontal: 2, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  viewMealButtonActive: { backgroundColor: themeColor, borderColor: themeColor },
  mealButtonText: { color: '#333', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  mealButtonTextActive: { color: '#fff' },
  viewMealButtonText: { color: '#333', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  resultsContainer: { marginTop: 30, padding: 15, backgroundColor: 'white', borderRadius: 10, borderLeftWidth: 5, borderLeftColor: themeColor, elevation: 1 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeColor },
  infoText: { fontSize: 14, color: '#666', textAlign: 'center' },
  infoTextBold: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 5 },
  summaryBox: { backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 25, borderBottomWidth: 5, borderBottomColor: themeColor, elevation: 2 },
  summaryTitle: { fontSize: 16, color: '#666', marginBottom: 5 },
  summaryKcal: { fontSize: 32, fontWeight: 'bold', color: themeColor },
  mealDetailContainer: { marginTop: 10, padding: 15, backgroundColor: 'white', borderRadius: 10, borderLeftWidth: 5, borderLeftColor: '#f59042', elevation: 1, marginBottom: 30 },
  mealDetailTitleText: { fontSize: 16, fontWeight: 'bold', color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  mealItemBox: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealItemDescription: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  mealItemMacros: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  mealItemCalorieText: { fontSize: 14, fontWeight: 'bold', color: themeColor, marginRight: 10 },
  mealItemMacroText: { fontSize: 12, color: '#666', marginLeft: 5 },
  noItemsText: { textAlign: 'center', fontSize: 15, color: '#999', padding: 20, backgroundColor: 'white', borderRadius: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, alignItems: 'center' },
  macroLabel: { flexDirection: 'row', alignItems: 'center' },
  macroEmoji: { fontSize: 16, marginRight: 5 },
  macroTextBold: { fontWeight: 'bold', color: '#333' },
  macroValue: { fontSize: 16, fontWeight: 'bold', color: themeColor },
});
