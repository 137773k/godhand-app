import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing, emberGradient } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import useUserProfile from '../hooks/useUserProfile';
import {
  calcFull,
  type BmrResult,
  type DietGoal,
} from '../utils/bmr';

type Props = NativeStackScreenProps<RootStackParamList, 'Diet'>;

/** 目标标签映射 */
const goalLabels: Record<DietGoal, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  fat_loss:    { label: '减脂模式', color: '#e0613a', icon: 'flame' },
  muscle_gain: { label: '增肌模式', color: '#5e6ad2', icon: 'barbell' },
  maintenance:  { label: '维持模式', color: '#2ea84a', icon: 'shield-checkmark' },
};

const macroMeta: Record<string, { name: string; color: string; kcalPerG: number; icon: string }> = {
  protein: { name: '蛋白质', color: '#e0613a', kcalPerG: 4, icon: '🥩' },
  carbs:   { name: '碳水',   color: '#f0a040', kcalPerG: 4, icon: '🍚' },
  fat:     { name: '脂肪',   color: '#e0c060', kcalPerG: 9, icon: '🧈' },
};

/** 根据目标+热量生成个性化食谱 */
function generateMeals(targetKcal: number, goal: DietGoal) {
  const isFatLoss = goal === 'fat_loss';

  const breakfastKcal = Math.round(targetKcal * 0.28);
  const lunchKcal = Math.round(targetKcal * 0.35);
  const dinnerKcal = Math.round(targetKcal * 0.25);
  const snackKcal = targetKcal - breakfastKcal - lunchKcal - dinnerKcal;

  return [
    {
      key: 'breakfast',
      title: '早餐',
      time: '07:30',
      kcal: breakfastKcal,
      icon: '☀️',
      foods: isFatLoss
        ? '燕麦50g + 鸡蛋2个 + 无糖豆浆300ml'
        : '全麦面包2片 + 鸡蛋3个 + 牛油果半个 + 牛奶250ml',
      protein: isFatLoss ? '28g' : '35g',
    },
    {
      key: 'lunch',
      title: '午餐',
      time: '12:00',
      kcal: lunchKcal,
      icon: '🍱',
      foods: isFatLoss
        ? '糙米100g + 鸡胸肉150g + 西兰花200g'
        : '白米饭150g + 牛肉150g + 西兰花200g + 橄榄油5ml',
      protein: isFatLoss ? '42g' : '48g',
    },
    {
      key: 'dinner',
      title: '晚餐',
      time: '18:30',
      kcal: dinnerKcal,
      icon: '🌙',
      foods: isFatLoss
        ? '红薯150g + 虾仁120g + 菠菜200g'
        : '土豆200g + 三文鱼150g + 芦笋150g',
      protein: isFatLoss ? '32g' : '38g',
    },
    {
      key: 'snack',
      title: '加餐',
      time: '15:30',
      kcal: snackKcal,
      icon: '🥤',
      foods: isFatLoss
        ? '希腊酸奶150g + 蓝莓50g'
        : '乳清蛋白粉30g + 香蕉1根 + 坚果20g',
      protein: isFatLoss ? '14g' : '28g',
    },
  ];
}

const STORAGE_KEY = 'diet_eaten_macros_v1';

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

type EatenMacros = { protein: number; carbs: number; fat: number; date: string };

export default function DietScreen({ navigation }: Props) {
  const { profile, isReady } = useUserProfile();
  const [result, setResult] = useState<BmrResult | null>(null);

  // 实际摄入追踪
  const [eatenMacros, setEatenMacros] = useState<EatenMacros>(() => ({
    protein: 0, carbs: 0, fat: 0, date: getDateKey(),
  }));

  // 输入框
  const [logProtein, setLogProtein] = useState('');
  const [logCarbs, setLogCarbs] = useState('');
  const [logFat, setLogFat] = useState('');

  // 日期重置
  useEffect(() => {
    const today = getDateKey();
    if (eatenMacros.date !== today) {
      setEatenMacros({ protein: 0, carbs: 0, fat: 0, date: today });
    }
  }, []);

  useEffect(() => {
    if (!isReady || !profile) return;
    const r = calcFull(profile, profile.dietGoal ?? 'maintenance');
    setResult(r);
  }, [isReady, profile]);

  const meals = useMemo(() => {
    if (!result) return [];
    return generateMeals(result.targetKcal, result.goal);
  }, [result]);

  // 累计热量
  const eatenKcal = useMemo(() => {
    return (
      eatenMacros.protein * 4 +
      eatenMacros.carbs * 4 +
      eatenMacros.fat * 9
    );
  }, [eatenMacros]);

  // 记录食物
  const handleLogFood = () => {
    const p = parseFloat(logProtein) || 0;
    const c = parseFloat(logCarbs) || 0;
    const f = parseFloat(logFat) || 0;
    if (p === 0 && c === 0 && f === 0) return;

    setEatenMacros((prev) => ({
      ...prev,
      protein: prev.protein + p,
      carbs: prev.carbs + c,
      fat: prev.fat + f,
    }));
    setLogProtein('');
    setLogCarbs('');
    setLogFat('');
  };

  if (!isReady || !result) {
    return (
      <ScreenContainer>
        <BackButton onPress={() => navigation.navigate('Home')} />
        <View style={styles.loadWrap}>
          <Text style={styles.loadText}>计算基础代谢中…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const goalCfg = goalLabels[result.goal];
  const totalProtein = meals.reduce((sum, m) => sum + parseInt(m.protein, 10), 0);
  const progressPct = result.targetKcal > 0
    ? Math.min(100, Math.round((eatenKcal / result.targetKcal) * 100))
    : 0;

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SectionHeader
          title="饮食计划"
          subtitle="基于你的身体数据自动计算基础代谢，制定个性化食谱。"
        />

        {/* 目标模式标签 */}
        <View style={[styles.goalTag, { borderColor: goalCfg.color + '40' }]}>
          <Ionicons name={goalCfg.icon} size={18} color={goalCfg.color} />
          <Text style={[styles.goalTagText, { color: goalCfg.color }]}>{goalCfg.label}</Text>
          <Text style={styles.goalTagKcal}>目标 {result.targetKcal} kcal/天</Text>
        </View>

        {/* BMR / TDEE 卡片 */}
        <View style={styles.bmrCard}>
          <Text style={styles.cardTitle}>⚡ 基础代谢分析</Text>
          <View style={styles.bmrRow}>
            <View style={styles.bmrItem}>
              <Text style={styles.bmrValue}>{result.bmr}</Text>
              <Text style={styles.bmrLabel}>基础代谢 (BMR)</Text>
              <Text style={styles.bmrHint}>静息状态消耗</Text>
            </View>
            <View style={styles.bmrDivider} />
            <View style={styles.bmrItem}>
              <Text style={styles.bmrValue}>{result.tdee}</Text>
              <Text style={styles.bmrLabel}>每日消耗 (TDEE)</Text>
              <Text style={styles.bmrHint}>含日常活动</Text>
            </View>
            <View style={styles.bmrDivider} />
            <View style={styles.bmrItem}>
              <Text style={[styles.bmrValue, { color: goalCfg.color }]}>{result.targetKcal}</Text>
              <Text style={styles.bmrLabel}>目标摄入</Text>
              <Text style={styles.bmrHint}>
                {result.goal === 'fat_loss' ? '赤字' : result.goal === 'muscle_gain' ? '盈余' : '持平'}
                {' '}{Math.abs(result.tdee - result.targetKcal)} kcal
              </Text>
            </View>
          </View>
          <Text style={styles.formula}>
            Mifflin-St Jeor 公式 • {profile?.gender === 'male' ? '男' : '女'} • {profile?.age}岁 • {profile?.heightCm}cm • {profile?.weightKg}kg
          </Text>
        </View>

        {/* 宏量素分配 */}
        <View style={styles.macroCard}>
          <Text style={styles.cardTitle}>🥩 宏量素分配</Text>
          <View style={styles.macroBars}>
            {(['protein', 'carbs', 'fat'] as const).map((key) => {
              const labels = { protein: '蛋白质', carbs: '碳水', fat: '脂肪' };
              const colors = { protein: '#e0613a', carbs: '#f0a040', fat: '#e0c060' };
              const g = result.macros[`${key}G` as const] as number;
              const kcal = result.macros[`${key}Kcal` as const] as number;
              const pct = Math.round((kcal / result.targetKcal) * 100);
              return (
                <View key={key} style={styles.macroRow}>
                  <View style={styles.macroHead}>
                    <Text style={styles.macroName}>{labels[key]}</Text>
                    <Text style={styles.macroVal}>{g}g ({kcal}kcal · {pct}%)</Text>
                  </View>
                  <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${pct}%`, backgroundColor: colors[key] }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 今日已摄入 —— 宏量素进度条 */}
        <View style={styles.macroCard}>
          <Text style={styles.cardTitle}>📊 今日已摄入</Text>
          <View style={styles.macroBars}>
            {(['protein', 'carbs', 'fat'] as const).map((key) => {
              const meta = macroMeta[key];
              const targetG = result.macros[`${key}G` as const] as number;
              const eatenG = eatenMacros[key];
              const pct = targetG > 0 ? Math.min(100, Math.round((eatenG / targetG) * 100)) : 0;
              return (
                <View key={key} style={styles.macroRow}>
                  <View style={styles.macroHead}>
                    <Text style={styles.macroName}>
                      {meta.icon} {meta.name}
                    </Text>
                    <Text style={[styles.macroVal, { color: meta.color }]}>
                      {eatenG}g / {targetG}g ({pct}%)
                    </Text>
                  </View>
                  <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* 食物记录输入 */}
          <View style={styles.logSection}>
            <Text style={styles.logTitle}>快速记录</Text>
            <View style={styles.logRow}>
              {(['protein', 'carbs', 'fat'] as const).map((key) => {
                const meta = macroMeta[key];
                const setters = {
                  protein: setLogProtein,
                  carbs: setLogCarbs,
                  fat: setLogFat,
                };
                const values = {
                  protein: logProtein,
                  carbs: logCarbs,
                  fat: logFat,
                };
                return (
                  <View key={key} style={styles.logItem}>
                    <Text style={styles.logLabel}>{meta.name.slice(0, 1)}</Text>
                    <TextInput
                      style={styles.logInput}
                      value={values[key]}
                      onChangeText={setters[key]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.textDim}
                      maxLength={4}
                    />
                    <Text style={styles.logUnit}>g</Text>
                  </View>
                );
              })}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogFood}
                style={styles.logBtn}
              >
                <Text style={styles.logBtnText}>记录</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 当日热量进度 */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>🔥 今日摄入热量</Text>
          <View style={styles.progressTop}>
            <Text style={styles.progressVal}>{eatenKcal}</Text>
            <Text style={styles.progressTotal}>/ {result.targetKcal} kcal</Text>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={progressPct > 90 ? ['#e0613a', '#e04830'] : emberGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.progressFill, { width: `${Math.min(100, progressPct)}%` }]}
            />
          </View>
          <Text style={styles.progressHint}>
            剩余 {Math.max(0, result.targetKcal - eatenKcal)} kcal
            {progressPct > 95 ? ' ⚠️ 快达标了，注意控制！' : progressPct > 80 ? ' 🔔 进度良好，保持节奏' : ''}
          </Text>
        </View>

        {/* 四餐食谱 */}
        <Text style={styles.sectionTitle}>📋 今日食谱</Text>
        <View style={styles.mealList}>
          {meals.map((meal) => (
            <View key={meal.key} style={styles.mealCard}>
              <View style={styles.mealHead}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealIcon}>{meal.icon}</Text>
                  <View>
                    <Text style={styles.mealTitle}>{meal.title}</Text>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                  </View>
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealKcal}>{meal.kcal}</Text>
                  <Text style={styles.mealKcalUnit}>kcal</Text>
                </View>
              </View>
              <Text style={styles.mealFoods}>{meal.foods}</Text>
              <View style={styles.mealMeta}>
                <Ionicons name="nutrition" size={14} color={Colors.gold} />
                <Text style={styles.mealProtein}>蛋白质 {meal.protein}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 14, paddingBottom: 40 },
  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadText: { color: Colors.textSecondary, fontSize: 14 },
  goalTag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  goalTagText: { fontSize: 13, fontWeight: '900' },
  goalTagKcal: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  cardTitle: {
    color: Colors.textPrimary, fontSize: 15, fontWeight: '900', marginBottom: 12,
  },
  bmrCard: {
    borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard, padding: 16,
  },
  bmrRow: { flexDirection: 'row', alignItems: 'center' },
  bmrItem: { flex: 1, alignItems: 'center', gap: 2 },
  bmrValue: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900' },
  bmrLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 2 },
  bmrHint: { color: Colors.textMuted, fontSize: 10 },
  bmrDivider: { width: 1, height: 48, backgroundColor: Colors.emberBorder },
  formula: {
    color: Colors.textMuted, fontSize: 10, marginTop: 12, textAlign: 'center',
  },
  macroCard: {
    borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard, padding: 16,
  },
  macroBars: { gap: 10 },
  macroRow: { gap: 4 },
  macroHead: { flexDirection: 'row', justifyContent: 'space-between' },
  macroName: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  macroVal: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  macroTrack: {
    height: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  macroFill: { height: '100%', borderRadius: 999 },
  logSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.emberBorder,
    gap: 8,
  },
  logTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 2,
  },
  logLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  logInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 4,
    textAlign: 'center',
  },
  logUnit: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  logBtn: {
    borderRadius: Radius.input,
    backgroundColor: Colors.emberButton,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logBtnText: {
    color: Colors.emberButtonText,
    fontSize: 12,
    fontWeight: '800',
  },
  progressCard: {
    borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard, padding: 16,
  },
  progressTop: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  progressVal: { color: Colors.textPrimary, fontSize: 32, fontWeight: '900' },
  progressTotal: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  progressPct: { color: Colors.ember, fontSize: 14, fontWeight: '900', marginLeft: 'auto' },
  progressTrack: {
    height: 12, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  progressHint: { color: Colors.textMuted, fontSize: 11, marginTop: 8 },
  sectionTitle: {
    color: Colors.textPrimary, fontSize: 16, fontWeight: '900', marginTop: 4,
  },
  mealList: { gap: 10 },
  mealCard: {
    borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard, padding: 14, gap: 8,
  },
  mealHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealIcon: { fontSize: 24 },
  mealTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '900' },
  mealTime: { color: Colors.textMuted, fontSize: 11 },
  mealRight: { alignItems: 'flex-end' },
  mealKcal: { color: Colors.gold, fontSize: 20, fontWeight: '900' },
  mealKcalUnit: { color: Colors.textMuted, fontSize: 10 },
  mealFoods: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  mealMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealProtein: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
  bottomPad: { height: 20 },
});
