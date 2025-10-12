// app/(tabs)/historico.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa a base de dados local
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

// --- FIM DAS INTERFACES ---

// 🟢 NOVO: Cria uma lista "plana" com todos os alimentos de todas as categorias
const allFoods: FoodItem[] = Object.values(FoodDatabase).flat();

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
    <Text style={styles.macroValue}>{value ? value.toFixed(1) : '0.0'} {unit}</Text>
  </View>
);

const processDailyData = (entries: FoodEntry[], today: string) => {
  const todayEntries = entries.filter(entry => entry.date === today);
  let totalCalories = 0;

  const mealMap = new Map<MealType, GroupedMealData>();
  MEAL_TYPES.forEach(type => {
    mealMap.set(type, { mealType: type, totalCalories: 0, items: [] });
  });

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
    console.error('Falha ao carregar o resumo diário e detalhes.', e);
  }
};

// ✅ CORRIGIDO: Componente MealDetail definido antes de ser usado
const MealDetail = ({ mealData }: { mealData: GroupedMealData | undefined }) => {
  if (!mealData || mealData.items.length === 0) {
    return (
      <Text style={styles.noItemsText}>
        Nenhum item registrado para esta refeição hoje.
      </Text>
    );
  }

  return (
    <View style={styles.mealDetailContainer}>
      <Text style={styles.mealDetailTitleText}>
        Detalhes de {mealData.mealType} ({mealData.totalCalories} Kcal)
      </Text>

      {mealData.items.map(item => (
        <View key={item.id} style={styles.mealItemBox}>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.mealItemMacros}>
            <Text style={styles.itemKcal}>{Math.round(item.data.calories)} Kcal</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function HistoricoScreen() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<NutritionResult | null>(null);
  const [dailyTotalCalories, setDailyTotalCalories] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Café');
  const [dailyMealsData, setDailyMealsData] = useState<GroupedMealData[]>([]);
  const [viewingMeal, setViewingMeal] = useState<MealType>('Café');

  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const loadDailySummary = useCallback(async () => {
    await getDailySummary(setDailyTotalCalories, setDailyMealsData);
  }, []);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

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
      console.error('Falha ao salvar histórico.', e);
      Alert.alert('Erro', 'Não foi possível guardar o registro localmente.');
    }
  };

  const cleanNameForSearch = (name: string) => name.toUpperCase().replace(/[^A-Z]/g, '');

  const handleQueryChange = (text: string) => {
    setQuery(text);
    
    const quantityMatch = text.match(/^(\d+\s*(g|ml|fatias|unidades)?\s*(de)?\s*)/i);
    const foodNamePart = quantityMatch ? text.substring(quantityMatch[0].length) : text;
    
    if (foodNamePart.trim().length > 1) {
      const searchName = cleanNameForSearch(foodNamePart);
      const filteredFoods = allFoods.filter(item =>
        cleanNameForSearch(item.name).includes(searchName)
      );
      setSuggestions(filteredFoods.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const onSuggestionPress = (foodName: string) => {
    const quantityMatch = query.match(/^(\d+\s*(g|ml|fatias|unidades)?\s*(de)?\s*)/i);
    const quantityPart = quantityMatch ? quantityMatch[0] : '';
    
    setQuery(`${quantityPart}${foodName} `);
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Erro', 'Digite a quantidade e o alimento.');
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    const quantityMatch = query.trim().match(/(\d+)\s*(g|ml)/i);
    const quantityInGrams = quantityMatch ? parseFloat(quantityMatch[1]) : 100;

    const rawFoodName = query.replace(quantityMatch ? quantityMatch[0] : '', '').replace(/de\s*/i, '').trim();
    const finalSearchTerm = cleanNameForSearch(rawFoodName.length > 3 ? rawFoodName : query);

    const foundFood = allFoods.find(item =>
      cleanNameForSearch(item.name).includes(finalSearchTerm)
    );

    if (!foundFood) {
      Alert.alert('Não encontrado', `Alimento "${rawFoodName}" não encontrado.`);
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

    Alert.alert('Sucesso!', `${finalResult.calories} Kcal registradas em ${selectedMeal}!`);
    setQuery('');
    setIsLoading(false);
  };

  const currentMealDetails = dailyMealsData.find(m => m.mealType === viewingMeal);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Alimentação',
          headerStyle: { backgroundColor: themeColor },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Total Consumido Hoje</Text>
          <Text style={styles.summaryKcal}>{dailyTotalCalories} Kcal</Text>
        </View>

        <Text style={styles.headerTitle}>Refeição para Registro</Text>
        <View style={styles.mealSelectorContainer}>
          {MEAL_TYPES.map(meal => (
            <Pressable
              key={meal}
              style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
              onPress={() => setSelectedMeal(meal)}
              disabled={isLoading}
            >
              <Text style={[styles.mealButtonText, selectedMeal === meal && styles.mealButtonTextActive]}>
                {meal}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.headerTitle, { marginTop: 20 }]}>Adicionar Alimento</Text>
        
        <View>
            <TextInput
              style={styles.input}
              placeholder="Ex: 150g de Arroz Branco"
              placeholderTextColor="#999"
              value={query}
              onChangeText={handleQueryChange}
              editable={!isLoading}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            />
            
            {isInputFocused && suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.name}
                    style={styles.suggestionsList}
                    renderItem={({ item }) => (
                        <Pressable style={styles.suggestionItem} onPress={() => onSuggestionPress(item.name)}>
                            <Text style={styles.suggestionText}>{item.name}</Text>
                        </Pressable>
                    )}
                    keyboardShouldPersistTaps="always"
                />
            )}
        </View>

        <Pressable
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Calcular e Registrar Refeição</Text>
          )}
        </Pressable>

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
              <Text style={[styles.infoText, { marginBottom: 10 }]}>
                A aplicação usa a base de dados local.
              </Text>
              <Text style={styles.infoTextBold}>
                Formato: [Quantidade em g/ml] [Nome do Alimento]
              </Text>
            </View>
          )}
        </View>

        <View style={styles.separator} />

        <Text style={styles.listSectionHeader}>Histórico Detalhado do Dia</Text>
        <View style={styles.mealSelectorContainer}>
          {dailyMealsData.map((meal) => (
            <Pressable
              key={`view-${meal.mealType}`}
              style={[styles.viewMealButton, viewingMeal === meal.mealType && styles.viewMealButtonActive]}
              onPress={() => setViewingMeal(meal.mealType)}
            >
              <Text style={[styles.viewMealButtonText, viewingMeal === meal.mealType && styles.mealButtonTextActive]}>
                {meal.mealType} ({meal.totalCalories} Kcal)
              </Text>
            </Pressable>
          ))}
        </View>

        <MealDetail mealData={currentMealDetails} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  listSectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: themeColor },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  searchButton: {
    backgroundColor: themeColor,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 10,
  },
  mealSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mealButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    minWidth: '22%',
  },
  viewMealButton: {
    width: '48%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 3,
    marginHorizontal: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  mealButtonActive: {
    backgroundColor: themeColor,
    shadowColor: themeColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  viewMealButtonActive: {
    backgroundColor: themeColor,
    borderColor: themeColor,
  },
  mealButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  mealButtonTextActive: { color: 'white', fontWeight: 'bold' },
  viewMealButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  searchButtonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resultsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: themeColor,
    elevation: 1,
  },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeColor },
  infoText: { fontSize: 14, color: '#666', textAlign: 'center' },
  infoTextBold: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 5 },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth: 5,
    borderBottomColor: themeColor,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, color: '#666', marginBottom: 5 },
  summaryKcal: { fontSize: 32, fontWeight: 'bold', color: themeColor },
  // 🟢 ESTILOS DA SEÇÃO DE DETALHES (ADICIONADOS)
  mealDetailContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#f59042',
    elevation: 1,
    marginBottom: 30,
  },
  mealDetailTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  mealItemBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    paddingRight: 10, 
  },
  itemKcal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColor,
    marginLeft: 10,
  },
  mealItemMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  mealItemCalorieText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: themeColor,
    marginRight: 10,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#999',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  // 🟢 ESTILOS DE MACROS (ADICIONADOS)
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    alignItems: 'center',
  },
  macroLabel: { flexDirection: 'row', alignItems: 'center' },
  macroEmoji: { fontSize: 16, marginRight: 5 },
  macroTextBold: { fontWeight: 'bold', color: '#333' },
  macroValue: { fontSize: 16, fontWeight: 'bold', color: themeColor },
  // 🟢 NOVOS ESTILOS PARA O AUTOCOMPLETE
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  mealListSection: {
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mealTotalKcal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColor,
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  }
});