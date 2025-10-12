// utils/calorieCalculator.ts

export interface BMRInput {
  weight: number; // em kg
  height: number; // em cm
  age: number;    // em anos
  gender: 'Masculino' | 'Feminino';
  activityLevel: ActivityLevelKey;
  targetWeight?: number; // Opcional: O peso que o utilizador deseja alcançar
  goalDate?: string;     // Opcional: A data para alcançar a meta
}

export type ActivityLevelKey = 'sedentario' | 'leve' | 'moderado' | 'alto' | 'muito_alto';

export const ACTIVITY_LEVELS: Record<ActivityLevelKey, { label: string, multiplier: number }> = {
    sedentario: { label: 'Sedentário (Pouco ou nenhum exercício)', multiplier: 1.2 },
    leve: { label: 'Leve (1-3 dias/semana)', multiplier: 1.375 },
    moderado: { label: 'Moderado (3-5 dias/semana)', multiplier: 1.55 },
    alto: { label: 'Ativo (6-7 dias/semana)', multiplier: 1.725 },
    muito_alto: { label: 'Muito Ativo (2x ao dia)', multiplier: 1.9 },
};

const KCAL_PER_KG = 7700; // Calorias aproximadas por kg de gordura corporal

export function calculateTDEE({
  weight,
  height,
  age,
  gender,
  activityLevel = 'moderado',
  targetWeight,
  goalDate,
}: BMRInput): number {
  let bmr: number;

  // 1. Calcula a Taxa Metabólica Basal (BMR)
  if (gender === 'Masculino') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else { // Feminino
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // 2. Calcula o TDEE de manutenção
  const multiplier = ACTIVITY_LEVELS[activityLevel]?.multiplier || ACTIVITY_LEVELS['moderado'].multiplier;
  let tdee = bmr * multiplier;

  // 3. Ajusta o TDEE com base na meta e no prazo
  if (targetWeight && targetWeight > 0 && goalDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
      const endDate = new Date(goalDate);
      
      if (endDate > today) {
          const diffTime = Math.abs(endDate.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0) {
              const weightDifference = weight - targetWeight; // Positivo se for para perder, negativo para ganhar
              const totalCalorieDifference = weightDifference * KCAL_PER_KG;
              const dailyAdjustment = totalCalorieDifference / diffDays;
              
              tdee -= dailyAdjustment; // Subtrai o ajuste (se for para ganhar, subtrai um negativo, i.e., soma)
          }
      }
  }

  return Math.round(tdee);
}