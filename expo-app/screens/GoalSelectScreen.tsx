import { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import PixelMonster from '../components/PixelMonster';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing, emberGradient } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { loadProfile, saveProfile } from '../hooks/useUserProfile';
import { goalToDietGoal } from '../utils/bmr';
import type { Gender } from '../utils/bmr';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalSelect'>;

type GoalType = 'fat_loss' | 'muscle_gain' | 'performance';
type GoalKey = 'lean' | 'muscle' | 'line' | 'vshape' | 'glute' | 'sport';
type RiskKey = 'joint' | 'back' | 'heart' | 'surgery' | 'pregnancy' | 'other';

type GoalConfig = {
  key: GoalKey;
  title: string;
  description: string;
  monsterEmoji: string;
  monsterHint: string;
  baseBodyFat: number;
  goalType: GoalType;
};

const allGoals: GoalConfig[] = [
  { key: 'lean', title: '精瘦型', description: '优先减脂，建立轻盈感和清晰轮廓。', monsterEmoji: '😈', monsterHint: '偷懒恶魔', baseBodyFat: 18, goalType: 'fat_loss' },
  { key: 'line', title: '线条型', description: '收紧腰腹与四肢，让线条更明显。', monsterEmoji: '🐗', monsterHint: '赘肉野猪', baseBodyFat: 20, goalType: 'fat_loss' },
  { key: 'muscle', title: '肌肉型', description: '增肌塑形，强化胸背肩与整体厚度。', monsterEmoji: '🐉', monsterHint: '脂肪龙', baseBodyFat: 16, goalType: 'muscle_gain' },
  { key: 'vshape', title: '宽肩倒三角', description: '扩大上半身视觉比例，压低体脂。', monsterEmoji: '🦖', monsterHint: '暴食暴龙', baseBodyFat: 15, goalType: 'muscle_gain' },
  { key: 'glute', title: '翘臀腿型', description: '聚焦臀腿塑形，同时控制体脂率。', monsterEmoji: '🐗', monsterHint: '赘肉野猪', baseBodyFat: 21, goalType: 'muscle_gain' },
  { key: 'sport', title: '运动表现型', description: '兼顾爆发、耐力与功能性力量。', monsterEmoji: '👹', monsterHint: '肥胖巨魔', baseBodyFat: 17, goalType: 'performance' },
];

const goalTypeLabels: { key: GoalType; label: string; icon: string }[] = [
  { key: 'fat_loss', label: '减脂', icon: '🔥' },
  { key: 'muscle_gain', label: '增肌', icon: '💪' },
  { key: 'performance', label: '提高运动表现', icon: '⚡' },
];

const riskOptions: Array<{ key: RiskKey; label: string }> = [
  { key: 'joint', label: '关节损伤' },
  { key: 'back', label: '腰伤/腰椎问题' },
  { key: 'heart', label: '心脏病/高血压' },
  { key: 'surgery', label: '近期手术' },
  { key: 'pregnancy', label: '孕期' },
  { key: 'other', label: '其他' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Navy 海军公式计算体脂率 */
function navyBodyFat(
  gender: Gender,
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number,
): number {
  if (gender === 'female' && hipCm != null) {
    return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
  }
  return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
}

/** Mifflin-St Jeor 基础代谢率 */
function calcBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

function BodyFatSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);

  const updateFromPosition = (positionX: number) => {
    if (!trackWidth) return;
    const ratio = clamp(positionX / trackWidth, 0, 1);
    const next = Math.round((min + ratio * (max - min)) * 10) / 10;
    onChange(next);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => updateFromPosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) => updateFromPosition(event.nativeEvent.locationX),
      }),
    [trackWidth, min, max],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const progress = (value - min) / (max - min || 1);

  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderLabelRow}>
        <Text style={styles.sliderEdge}>{min}%</Text>
        <Text style={styles.sliderCurrent}>{value.toFixed(1)}%</Text>
        <Text style={styles.sliderEdge}>{max}%</Text>
      </View>
      <View style={styles.sliderTrack} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={styles.sliderTrackBase} />
        <LinearGradient
          colors={[...emberGradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.sliderFill, { width: `${progress * 100}%` }]}
        />
        <View style={[styles.sliderThumb, { left: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const sanitizeDigits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

export default function GoalSelectScreen({ navigation, route }: Props) {
  // Profile
  const [profileGender, setProfileGender] = useState<Gender>('male');
  const [profileAge, setProfileAge] = useState(25);
  const [profileHeight, setProfileHeight] = useState(175);
  const [profileWeight, setProfileWeight] = useState(68);
  const [profileBmr, setProfileBmr] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      if (p) {
        setProfileGender(p.gender);
        setProfileAge(p.age);
        setProfileHeight(p.heightCm);
        setProfileWeight(p.weightKg);
        setProfileBmr(p.bmr ?? calcBMR(p.gender, p.weightKg, p.heightCm, p.age));
      }
    })();
  }, []);

  // Goal type & goal
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalKey | null>(null);

  // Navy formula inputs
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');

  // Navy calculated body fat
  const navyBF = useMemo(() => {
    const w = Number(waist);
    const n = Number(neck);
    if (!w || !n || w <= n) return null;
    if (profileGender === 'female') {
      const h = Number(hip);
      if (!h) return null;
      return Math.round(navyBodyFat(profileGender, w, n, profileHeight, h) * 10) / 10;
    }
    return Math.round(navyBodyFat(profileGender, w, n, profileHeight) * 10) / 10;
  }, [waist, neck, hip, profileGender, profileHeight]);

  // Use navyBF if available, otherwise use stored BMR
  const displayBmr = useMemo(() => {
    if (profileBmr != null) return profileBmr;
    return calcBMR(profileGender, profileWeight, profileHeight, profileAge);
  }, [profileBmr, profileGender, profileWeight, profileHeight, profileAge]);

  const currentBodyFat = navyBF ?? 28;
  const filteredGoals = useMemo(
    () => (goalType ? allGoals.filter((g) => g.goalType === goalType) : []),
    [goalType],
  );

  const [selectedRisks, setSelectedRisks] = useState<RiskKey[]>([]);
  const [otherRisk, setOtherRisk] = useState('');
  const [confirmedRisk, setConfirmedRisk] = useState(false);

  const selectedGoalConfig = allGoals.find((goal) => goal.key === selectedGoal) ?? null;

  const [targetBodyFat, setTargetBodyFat] = useState<number | null>(null);

  const effectiveTargetBodyFat = useMemo(() => {
    if (!selectedGoalConfig) return null;
    return targetBodyFat ?? selectedGoalConfig.baseBodyFat;
  }, [selectedGoalConfig, targetBodyFat]);

  const gapData = useMemo(() => {
    if (!selectedGoalConfig || effectiveTargetBodyFat == null) return null;

    const leanMass = profileWeight * (1 - currentBodyFat / 100);
    const targetWeight = leanMass / (1 - effectiveTargetBodyFat / 100);
    const bodyFatGap = Math.max(0, currentBodyFat - effectiveTargetBodyFat);
    const weightGap = Math.max(0, profileWeight - targetWeight);
    const durationWeeks = Math.max(4, Math.ceil(bodyFatGap * 1.4));

    if (bodyFatGap < 5) {
      return { targetWeight, bodyFatGap, weightGap, durationWeeks, monsterName: '偷懒恶魔', monsterEmoji: '😈', hp: 30, monsterIndex: 5 };
    }
    if (bodyFatGap < 10) {
      return { targetWeight, bodyFatGap, weightGap, durationWeeks, monsterName: '赘肉野猪', monsterEmoji: '🐗', hp: 60, monsterIndex: 6 };
    }
    if (bodyFatGap < 15) {
      return { targetWeight, bodyFatGap, weightGap, durationWeeks, monsterName: '脂肪龙', monsterEmoji: '🐉', hp: 100, monsterIndex: 4 };
    }
    if (bodyFatGap < 20) {
      return { targetWeight, bodyFatGap, weightGap, durationWeeks, monsterName: '暴食暴龙', monsterEmoji: '🦖', hp: 150, monsterIndex: 1 };
    }
    return { targetWeight, bodyFatGap, weightGap, durationWeeks, monsterName: '肥胖巨魔', monsterEmoji: '👹', hp: 200, monsterIndex: 0 };
  }, [currentBodyFat, profileWeight, effectiveTargetBodyFat, selectedGoalConfig]);

  const progressPercent = gapData ? clamp(gapData.bodyFatGap / 20, 0, 1) : 0;
  const canContinue = Boolean(selectedGoal && confirmedRisk);

  const toggleRisk = (key: RiskKey) => {
    setSelectedRisks((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSelectGoal = (goal: GoalConfig) => {
    setSelectedGoal(goal.key);
    setTargetBodyFat(goal.baseBodyFat);
  };

  const showNavy = navyBF != null;

  return (
    <ScreenContainer>
      <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        <Text style={styles.backText}>返回上一步</Text>
      </TouchableOpacity>

      <SectionHeader
        title="选择你的目标身材"
        subtitle="通过海军公式精确测量体脂，汇总成一套专属蜕变计划。"
      />

      {/* Navy 公式输入 */}
      <View style={styles.statsCard}>
        <Text style={styles.blockTitle}>海军公式体脂测量</Text>
        <Text style={styles.navyHint}>
          {profileGender === 'female'
            ? '输入腰围、颈围、臀围（cm），系统用海军公式计算体脂率'
            : '输入腰围、颈围（cm），系统用海军公式计算体脂率'}
        </Text>
        <View style={styles.navyRow}>
          <View style={styles.navyItem}>
            <TextInput
              style={styles.navyInput}
              value={waist}
              onChangeText={(v) => setWaist(sanitizeDigits(v, 3))}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={Colors.textDim}
              maxLength={3}
            />
            <Text style={styles.navyUnit}>腰围 cm</Text>
          </View>
          <View style={styles.navyItem}>
            <TextInput
              style={styles.navyInput}
              value={neck}
              onChangeText={(v) => setNeck(sanitizeDigits(v, 3))}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={Colors.textDim}
              maxLength={3}
            />
            <Text style={styles.navyUnit}>颈围 cm</Text>
          </View>
          {profileGender === 'female' ? (
            <View style={styles.navyItem}>
              <TextInput
                style={styles.navyInput}
                value={hip}
                onChangeText={(v) => setHip(sanitizeDigits(v, 3))}
                keyboardType="number-pad"
                placeholder="--"
                placeholderTextColor={Colors.textDim}
                maxLength={3}
              />
              <Text style={styles.navyUnit}>臀围 cm</Text>
            </View>
          ) : null}
        </View>
        {showNavy ? (
          <Text style={styles.navyResult}>海军公式体脂率：{navyBF?.toFixed(1)}%</Text>
        ) : (
          <Text style={styles.navyPlaceholder}>输入尺寸后自动计算</Text>
        )}
      </View>

      {/* 当前体态数据 */}
      <View style={styles.statsCard}>
        <Text style={styles.blockTitle}>当前体态数据</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileHeight}cm</Text>
            <Text style={styles.statLabel}>身高</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileWeight}kg</Text>
            <Text style={styles.statLabel}>体重</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentBodyFat.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>体脂率</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayBmr}</Text>
            <Text style={styles.statLabel}>基础代谢</Text>
          </View>
        </View>
      </View>

      {/* 目标方向选择 */}
      <View style={styles.sectionBlock}>
        <Text style={styles.blockTitle}>你的目标方向</Text>
        <View style={styles.goalTypeRow}>
          {goalTypeLabels.map((gt) => {
            const active = goalType === gt.key;
            return (
              <TouchableOpacity
                key={gt.key}
                activeOpacity={0.9}
                onPress={() => {
                  setGoalType(gt.key);
                  setSelectedGoal(null);
                  setTargetBodyFat(null);
                }}
                style={[styles.goalTypeBtn, active && styles.goalTypeBtnActive]}
              >
                <Text style={styles.goalTypeIcon}>{gt.icon}</Text>
                <Text style={[styles.goalTypeLabel, active && styles.goalTypeLabelActive]}>{gt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 目标身材选择（按方向过滤） */}
      {goalType ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>目标身材选择</Text>
          <View style={styles.goalList}>
            {filteredGoals.map((goal) => {
              const active = selectedGoal === goal.key;
              return (
                <TouchableOpacity
                  key={goal.key}
                  activeOpacity={0.9}
                  onPress={() => handleSelectGoal(goal)}
                  style={[styles.goalCard, active && styles.goalCardActive]}
                >
                  <View style={[styles.goalMonster, active && styles.goalMonsterActive]}>
                    <Text style={styles.goalMonsterEmoji}>{goal.monsterEmoji}</Text>
                  </View>
                  <View style={styles.goalCopy}>
                    <Text style={[styles.goalTitle, active && styles.goalTitleActive]}>{goal.title}</Text>
                    <Text style={styles.goalDesc}>{goal.description}</Text>
                    <Text style={[styles.goalHint, active && styles.goalHintActive]}>
                      需要击败：{goal.monsterHint}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 差距分析 */}
      {selectedGoalConfig ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>差距分析</Text>
          {selectedGoalConfig && gapData && effectiveTargetBodyFat != null ? (
            <View style={styles.gapPanel}>
              <View style={styles.targetHeader}>
                <View>
                  <Text style={styles.targetTitle}>目标体脂率</Text>
                  <Text style={styles.targetSubtitle}>拖动调整到你愿意投入的强度</Text>
                </View>
                <Text style={styles.targetValue}>{effectiveTargetBodyFat.toFixed(1)}%</Text>
              </View>

              <BodyFatSlider value={effectiveTargetBodyFat} min={12} max={24} onChange={setTargetBodyFat} />

              <View style={styles.targetGrid}>
                <View style={styles.targetMetric}>
                  <Text style={styles.targetMetricLabel}>目标体重</Text>
                  <Text style={styles.targetMetricValue}>{gapData.targetWeight.toFixed(1)}kg</Text>
                </View>
                <View style={styles.targetMetric}>
                  <Text style={styles.targetMetricLabel}>预计周期</Text>
                  <Text style={styles.targetMetricValue}>{gapData.durationWeeks} 周</Text>
                </View>
              </View>

              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>需减脂</Text>
                  <Text style={styles.progressValue}>{gapData.bodyFatGap.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[...emberGradient]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
                  />
                </View>
              </View>

              <View style={styles.gapSummaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>需减重</Text>
                  <Text style={styles.summaryValue}>{gapData.weightGap.toFixed(1)}kg</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>怪兽血量</Text>
                  <Text style={styles.summaryValue}>{gapData.hp} HP</Text>
                </View>
              </View>

              <View style={styles.monsterPanel}>
                <View style={styles.monsterCopy}>
                  <Text style={styles.monsterTitle}>
                    怪兽等级：{gapData.monsterName} {gapData.monsterEmoji}
                  </Text>
                  <Text style={styles.monsterText}>
                    当前差距越大，BOSS 血量越高，计划周期与训练密度也会同步提升。
                  </Text>
                </View>
                <View style={styles.monsterArt}>
                  <PixelMonster monsterIndex={gapData.monsterIndex} defeated={false} isHit={false} size={92} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>先选择一个目标身材，系统才会计算你的差距与目标周期。</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* 健康风险评估 */}
      <View style={styles.sectionBlock}>
        <Text style={styles.blockTitle}>健康风险评估</Text>
        <View style={styles.riskList}>
          {riskOptions.map((risk) => {
            const active = selectedRisks.includes(risk.key);
            return (
              <TouchableOpacity
                key={risk.key}
                activeOpacity={0.9}
                onPress={() => toggleRisk(risk.key)}
                style={styles.riskItem}
              >
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Ionicons name="checkmark" size={14} color={Colors.emberButtonText} /> : null}
                </View>
                <Text style={styles.riskLabel}>{risk.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRisks.includes('other') ? (
          <TextInput
            value={otherRisk}
            onChangeText={setOtherRisk}
            placeholder="补充其他需要规避的情况"
            placeholderTextColor={Colors.textDim}
            style={styles.otherInput}
          />
        ) : null}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setConfirmedRisk((prev) => !prev)}
          style={styles.confirmRow}
        >
          <View style={[styles.checkbox, confirmedRisk && styles.checkboxActive]}>
            {confirmedRisk ? <Ionicons name="checkmark" size={14} color={Colors.emberButtonText} /> : null}
          </View>
          <Text style={styles.confirmText}>我已确认以上风险信息，并接受基于此生成计划。</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton
        label="开始蜕变计划"
        disabled={!canContinue}
        onPress={async () => {
          const existing = await loadProfile();
          if (existing) {
            await saveProfile({
              ...existing,
              goal: selectedGoal ?? '',
              targetBodyFat: effectiveTargetBodyFat ?? 15,
              dietGoal: goalToDietGoal(selectedGoal ?? ''),
            });
          }
          navigation.navigate('Home', {
            plan: {
              goal: selectedGoal ?? '',
              targetBodyFat: effectiveTargetBodyFat ?? 15,
              risks: selectedRisks,
            },
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginBottom: -4,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: Spacing.cardGap,
    gap: Spacing.cardGap,
  },
  sectionBlock: {
    gap: Spacing.cardGap,
  },
  blockTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  navyHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  navyRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  navyItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  navyInput: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    paddingVertical: 0,
    textAlign: 'center',
    width: '100%',
  },
  navyUnit: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  navyResult: {
    color: Colors.ember,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  navyPlaceholder: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  statItem: {
    flex: 1,
    minHeight: 82,
    borderRadius: Radius.input,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: Spacing.microGap,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  goalTypeRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  goalTypeBtn: {
    flex: 1,
    minHeight: 60,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  goalTypeBtnActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.emberLight,
  },
  goalTypeIcon: {
    fontSize: 22,
  },
  goalTypeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  goalTypeLabelActive: {
    color: Colors.ember,
  },
  goalList: {
    gap: Spacing.cardGap,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: 12,
  },
  goalCardActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.emberLight,
  },
  goalMonster: {
    width: 52,
    height: 52,
    borderRadius: Radius.card,
    backgroundColor: Colors.bgCardRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMonsterActive: {
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.ember,
  },
  goalMonsterEmoji: {
    fontSize: 28,
  },
  goalCopy: {
    flex: 1,
    gap: 2,
  },
  goalTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  goalTitleActive: {
    color: Colors.ember,
  },
  goalDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  goalHint: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  goalHintActive: {
    color: Colors.ember,
  },
  gapPanel: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: Spacing.cardGap,
    gap: Spacing.cardGap,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.cardGap,
    flex: 1,
  },
  targetTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  targetSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  targetValue: {
    color: Colors.ember,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
  },
  sliderWrap: {
    gap: Spacing.tightGap,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderEdge: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  sliderCurrent: {
    color: Colors.ember,
    fontSize: 14,
    fontWeight: '900',
  },
  sliderTrack: {
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
    overflow: 'visible',
  },
  sliderTrackBase: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.pill,
  },
  sliderFill: {
    height: 18,
    borderRadius: Radius.pill,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.emberButton,
    borderWidth: 2,
    borderColor: Colors.bgCardRaised,
    top: -5,
    marginLeft: -16,
  },
  targetGrid: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  targetMetric: {
    flex: 1,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: 12,
    alignItems: 'center',
    gap: Spacing.microGap,
  },
  targetMetricLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  targetMetricValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  progressBlock: {
    gap: Spacing.tightGap,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  progressValue: {
    color: Colors.ember,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  progressTrack: {
    height: 16,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  progressFill: {
    height: '100%',
  },
  gapSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: 12,
    gap: Spacing.microGap,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  monsterPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: 12,
  },
  monsterCopy: {
    flex: 1,
    gap: Spacing.tightGap,
  },
  monsterTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  monsterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  monsterArt: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPanel: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  riskList: {
    gap: Spacing.inlineGap,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.inlineGap,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.checkbox,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.ember,
  },
  riskLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  otherInput: {
    minHeight: 48,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.inlineGap,
  },
  confirmText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
