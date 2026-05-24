export type RootStackParamList = {
  Login: undefined;
  BasicInfo: undefined;
  GoalSelect: { assessment?: { bodyFat: number; muscleMass: number; bmi: number; posture: string } } | undefined;
  PhotoAssess: { basicInfo?: { age: string; height: string; weight: string; gender: string | null } } | undefined;
  Home: { plan?: { goal: string; targetBodyFat: number; risks: string[] } } | undefined;
  Training: undefined;
  Diet: undefined;
  Progress: undefined;
};
