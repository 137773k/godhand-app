import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { saveProfile } from '../hooks/useUserProfile';
import { freqToActivityLevel } from '../utils/bmr';
import type { Gender } from '../utils/bmr';

type Props = NativeStackScreenProps<RootStackParamList, 'BasicInfo'>;

type TrainingType = 'strength' | 'cardio' | 'functional' | 'none' | null;
type TrainingYears = 'lt6m' | '1-3y' | 'gt3y' | null;

const frequencies = [
  { key: '1-2', label: '1-2 天' },
  { key: '3-4', label: '3-4 天' },
  { key: '5-6', label: '5-6 天' },
  { key: '7', label: '每天' },
] as const;

const trainingTypes: { key: TrainingType; label: string; emoji: string }[] = [
  { key: 'strength', label: '力量训练', emoji: '🏋️' },
  { key: 'cardio', label: '有氧训练', emoji: '🏃' },
  { key: 'functional', label: '功能训练', emoji: '🤸' },
  { key: 'none', label: '无训练基础', emoji: '❌' },
];

const trainingYearsOptions: { key: TrainingYears; label: string }[] = [
  { key: 'lt6m', label: '半年以内' },
  { key: '1-3y', label: '1-3年' },
  { key: 'gt3y', label: '3年以上' },
];

export default function BasicInfoScreen({ navigation, route }: Props) {
  const hasTrainingBase = route.params?.hasTrainingBase;
  const [step, setStep] = useState(1);

  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState('18');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('68');
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]['key'] | null>(null);
  const [trainingType, setTrainingType] = useState<TrainingType>(
    hasTrainingBase === false ? 'none' : null,
  );
  const [trainingYears, setTrainingYears] = useState<TrainingYears>(null);

  const step1Done = Boolean(gender && age && height && weight);

  const canContinue = Boolean(
    gender && age && height && weight && trainingType &&
    (trainingType === 'none' || (frequency && trainingYears)),
  );

  const bmr = useMemo(() => {
    if (!gender || !age || !height || !weight) return null;
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (!w || !h || !a) return null;
    if (gender === 'male') {
      return Math.round(10 * w + 6.25 * h - 5 * a + 5);
    }
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }, [gender, age, height, weight]);

  const sanitizeDigits = useCallback((value: string, maxLength: number) => {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }, []);

  const showYears = trainingType !== 'none' && trainingType !== null;
  const showFreq = trainingType !== 'none';
  const btnLabel = step === 1 ? '下一步：训练背景' : '下一步：选择目标';
  const btnDisabled = step === 1 ? !step1Done : !canContinue;

  const handleNext = () => {
    if (step === 1 && step1Done) {
      setStep(2);
    }
  };

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.goBack()} />
      <SectionHeader title="基础信息" subtitle="补全你的身体基础数据，后续分析和计划会据此生成。" />

      {/* Step progress bar */}
      <View style={styles.stepBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setStep(1)}
          style={styles.stepItem}
        >
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>身体数据</Text>
        </TouchableOpacity>
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => { if (step1Done) setStep(2); }}
          style={styles.stepItem}
        >
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>训练背景</Text>
        </TouchableOpacity>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>性别</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGender('male')}
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>男</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGender('female')}
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>女</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>身体数据</Text>
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <TextInput
                  style={styles.dataInput}
                  value={age}
                  onChangeText={(value) => setAge(sanitizeDigits(value, 3))}
                  keyboardType="number-pad"
                  placeholder="--"
                  placeholderTextColor={Colors.textDim}
                  maxLength={3}
                />
                <Text style={styles.dataUnit}>岁</Text>
              </View>
              <View style={styles.dataItem}>
                <TextInput
                  style={styles.dataInput}
                  value={height}
                  onChangeText={(value) => setHeight(sanitizeDigits(value, 3))}
                  keyboardType="number-pad"
                  placeholder="--"
                  placeholderTextColor={Colors.textDim}
                  maxLength={3}
                />
                <Text style={styles.dataUnit}>cm</Text>
              </View>
              <View style={styles.dataItem}>
                <TextInput
                  style={styles.dataInput}
                  value={weight}
                  onChangeText={(value) => setWeight(sanitizeDigits(value, 3))}
                  keyboardType="number-pad"
                  placeholder="--"
                  placeholderTextColor={Colors.textDim}
                  maxLength={3}
                />
                <Text style={styles.dataUnit}>kg</Text>
              </View>
            </View>
            {bmr != null ? (
              <Text style={styles.bmrText}>基础代谢率 (BMR): {bmr} kcal/天</Text>
            ) : null}
          </View>
        </>
      ) : (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>训练基础</Text>
            <View style={styles.trainingGrid}>
              {trainingTypes.map((item) => {
                const active = trainingType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key ?? 'none-key'}
                    activeOpacity={0.85}
                    onPress={() => {
                      setTrainingType(item.key);
                      if (item.key === 'none') {
                        setTrainingYears(null);
                        setFrequency(null);
                      }
                    }}
                    style={[styles.trainingBtn, active && styles.trainingBtnActive]}
                  >
                    <Text style={styles.trainingEmoji}>{item.emoji}</Text>
                    <Text style={[styles.trainingLabel, active && styles.trainingLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showYears ? (
              <View style={styles.yearsRow}>
                {trainingYearsOptions.map((opt) => {
                  const active = trainingYears === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.85}
                      onPress={() => setTrainingYears(opt.key)}
                      style={[styles.yearsBtn, active && styles.yearsBtnActive]}
                    >
                      <Text style={[styles.yearsText, active && styles.yearsTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {showFreq ? (
          <View style={styles.field}>
            <Text style={styles.label}>运动频率</Text>
            <View style={styles.freqRow}>
              {frequencies.map((item) => {
                const active = frequency === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                    onPress={() => setFrequency(item.key)}
                    style={[styles.freqBtn, active && styles.freqBtnActive]}
                  >
                    <Text style={[styles.freqText, active && styles.freqTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          ) : null}
        </>
      )}

      <PrimaryButton
        label={btnLabel}
        disabled={btnDisabled}
        onPress={async () => {
          if (step === 1) {
            handleNext();
            return;
          }
          try {
            const g = gender as Gender;
            await saveProfile({
              gender: g,
              age: Number(age),
              heightCm: Number(height),
              weightKg: Number(weight),
              activityLevel: freqToActivityLevel(frequency ?? 'sedentary'),
              trainingType: trainingType ?? undefined,
              trainingYears: trainingYears ?? undefined,
              bmr: bmr ?? undefined,
            });
          } catch (e) {
            console.error('saveProfile error:', e);
          }
          navigation.navigate('GoalSelect');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stepLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: Colors.accent,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    maxWidth: 60,
  },
  stepLineActive: {
    backgroundColor: Colors.accent,
  },
  field: {
    gap: Spacing.inlineGap,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  genderBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  genderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  genderTextActive: {
    color: Colors.surface,
  },
  dataRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.input,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dataInput: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    paddingVertical: 0,
    textAlign: 'center',
    width: '100%',
  },
  dataUnit: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bmrText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  trainingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.tightGap,
  },
  trainingBtn: {
    width: '48.5%',
    minHeight: 48,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  trainingBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  trainingEmoji: {
    fontSize: 18,
  },
  trainingLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  trainingLabelActive: {
    color: Colors.surface,
  },
  yearsRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
    marginTop: Spacing.tightGap,
  },
  yearsBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearsBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  yearsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  yearsTextActive: {
    color: Colors.surface,
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  freqBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  freqText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  freqTextActive: {
    color: Colors.surface,
  },
});
