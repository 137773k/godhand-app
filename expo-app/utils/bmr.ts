/**
 * BMR / TDEE 计算工具
 * Mifflin-St Jeor Equation
 */

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type DietGoal = 'fat_loss' | 'muscle_gain' | 'maintenance';

export type UserBodyData = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
};

export type MacroBreakdown = {
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
};

export type BmrResult = {
  bmr: number;
  tdee: number;
  targetKcal: number;
  goal: DietGoal;
  macros: MacroBreakdown;
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const MACRO_FACTORS: Record<DietGoal, { protein: number; carbs: number; fat: number }> = {
  fat_loss: { protein: 1.8, carbs: 2.4, fat: 0.7 },
  muscle_gain: { protein: 2, carbs: 5, fat: 1 },
  maintenance: { protein: 1.5, carbs: 3.5, fat: 0.9 },
};

const KCAL_PER_G = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

/**
 * Mifflin-St Jeor 基础代谢率
 * 男: 10x体重 + 6.25x身高 - 5x年龄 + 5
 * 女: 10x体重 + 6.25x身高 - 5x年龄 - 161
 */
export function calcBMR(data: UserBodyData): number {
  const { gender, weightKg, heightCm, age } = data;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/** 每日总消耗 */
export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
}

/** 计算宏量素(按体重系数) */
export function calcMacros(weightKg: number, goal: DietGoal): MacroBreakdown {
  const factors = MACRO_FACTORS[goal];

  const proteinG = Math.round(weightKg * factors.protein);
  const carbsG = Math.round(weightKg * factors.carbs);
  const fatG = Math.round(weightKg * factors.fat);

  const proteinKcal = proteinG * KCAL_PER_G.protein;
  const carbsKcal = carbsG * KCAL_PER_G.carbs;
  const fatKcal = fatG * KCAL_PER_G.fat;

  return {
    proteinG,
    carbsG,
    fatG,
    proteinKcal,
    carbsKcal,
    fatKcal,
  };
}

/** 一站式计算 */
export function calcFull(data: UserBodyData, goal: DietGoal): BmrResult {
  const bmr = calcBMR(data);
  const tdee = calcTDEE(bmr, data.activityLevel);
  const macros = calcMacros(data.weightKg, goal);
  const targetKcal = macros.proteinKcal + macros.carbsKcal + macros.fatKcal;

  return { bmr, tdee, targetKcal, goal, macros };
}

/** 运动频率 -> ActivityLevel */
export function freqToActivityLevel(freq: string): ActivityLevel {
  switch (freq) {
    case '1-2': return 'sedentary';
    case '3-4': return 'light';
    case '5-6': return 'moderate';
    case '7':   return 'active';
    default:    return 'sedentary';
  }
}

/** 目标身材 -> DietGoal */
export function goalToDietGoal(goalKey: string): DietGoal {
  switch (goalKey) {
    case 'lean':
    case 'line':  return 'fat_loss';
    case 'muscle':
    case 'vshape':
    case 'glute':
    case 'sport': return 'muscle_gain';
    default:      return 'maintenance';
  }
}
