export type RootStackParamList = {
  Login: undefined;
  BasicInfo: { hasTrainingBase?: boolean } | undefined;
  GoalSelect: { assessment?: { bodyFat: number; muscleMass: number; bmi: number; posture: string } } | undefined;
  PhotoAssess: { basicInfo?: { age: number; height: number; weight: number; gender: string | null } } | undefined;
  Home: { plan?: { goal: string; targetBodyFat: number; risks: string[] } } | undefined;
  Training: undefined;
  Diet: undefined;
  Progress: undefined;
};
