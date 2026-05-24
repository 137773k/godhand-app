/**
 * BMR / TDEE 计算工具
 * Mifflin-St Jeor Equation (目前公认最准确的基础代谢公式)
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

/** 运动频率 → 活动系数 */
const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** 目标热量调整 (相对于TDEE) */
const GOAL_ADJUSTMENT: Record<DietGoal, number> = {
  fat_loss: -400,    // 减脂：赤字400大卡
  muscle_gain: 300,  // 增肌：盈余300大卡
  maintenance: 0,    // 维持：不变
};

/** 宏量素分配比例 [蛋白质, 碳水, 脂肪] */
const MACRO_SPLIT: Record<DietGoal, [number, number, number]> = {
  fat_loss: [0.40, 0.30, 0.30],
  muscle_gain: [0.35, 0.40, 0.25],
  maintenance: [0.30, 0.40, 0.30],
};

/** 每克宏量素热量 */
const KCAL_PER_G = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

/**
 * Mifflin-St Jeor 基础代谢率
 * 男: 10×体重 + 6.25×身高 - 5×年龄 + 5
 * 女: 10×体重 + 6.25×身高 - 5×年龄 - 161
 */
export function calcBMR(data: UserBodyData): number {
  const { gender, weightKg, heightCm, age } = data;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/** 每日总消耗 TDEE = BMR × 活动系数 */
export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
}

/** 根据目标调整热量 */
export function calcTargetKcal(tdee: number, goal: DietGoal): number {
  return Math.max(1200, tdee + GOAL_ADJUSTMENT[goal]);
}

/** 计算宏量素分配 (克数) */
export function calcMacros(targetKcal: number, goal: DietGoal): MacroBreakdown {
  const [pRatio, cRatio, fRatio] = MACRO_SPLIT[goal];

  const proteinKcal = Math.round(targetKcal * pRatio);
  const carbsKcal = Math.round(targetKcal * cRatio);
  const fatKcal = Math.round(targetKcal * fRatio);

  return {
    proteinG: Math.round(proteinKcal / KCAL_PER_G.protein),
    carbsG: Math.round(carbsKcal / KCAL_PER_G.carbs),
    fatG: Math.round(fatKcal / KCAL_PER_G.fat),
    proteinKcal,
    carbsKcal,
    fatKcal,
  };
}

/** 一站式计算 */
export function calcFull(data: UserBodyData, goal: DietGoal): BmrResult {
  const bmr = calcBMR(data);
  const tdee = calcTDEE(bmr, data.activityLevel);
  const targetKcal = calcTargetKcal(tdee, goal);
  const macros = calcMacros(targetKcal, goal);

  return { bmr, tdee, targetKcal, goal, macros };
}

/** 运动频率 → ActivityLevel */
export function freqToActivityLevel(freq: string): ActivityLevel {
  switch (freq) {
    case '1-2': return 'sedentary';
    case '3-4': return 'light';
    case '5-6': return 'moderate';
    case '7':   return 'active';
    default:    return 'sedentary';
  }
}

/** 目标身材 → DietGoal */
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
