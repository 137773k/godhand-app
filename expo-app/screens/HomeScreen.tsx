import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenContainer from '../components/ScreenContainer';
import useUserProfile from '../hooks/useUserProfile';
import { cardBorderSmall, Colors, Radius, Spacing, Typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type TabKey = 'Home' | 'Training' | 'Diet' | 'Progress';

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Home', label: '首页', icon: 'home-outline', activeIcon: 'home' },
  { key: 'Training', label: '训练', icon: 'barbell-outline', activeIcon: 'barbell' },
  { key: 'Diet', label: '饮食', icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { key: 'Progress', label: '数据', icon: 'trending-up-outline', activeIcon: 'trending-up' },
];

const goalDesc: Record<string, { emoji: string; label: string }> = {
  lean:   { emoji: '🔥', label: '精瘦减脂' },
  line:   { emoji: '📏', label: '线条雕刻' },
  muscle: { emoji: '💪', label: '肌肉塑形' },
  vshape: { emoji: '🔻', label: '宽肩倒三角' },
  glute:  { emoji: '🍑', label: '翘臀腿型' },
  sport:  { emoji: '⚡', label: '运动表现' },
};

const CK = {
  checkin: 'checkin_v1',
  training: 'today_training_v1',
  diet: 'today_diet_v1',
  weight: 'today_weight_v1',
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/* ---- CircularGauge ---- */

function CircularGauge({
  percent,
  size,
  strokeWidth,
  goalLabel,
  goalEmoji,
  targetBodyFat,
}: {
  percent: number;
  size: number;
  strokeWidth: number;
  goalLabel?: string;
  goalEmoji?: string;
  targetBodyFat?: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const progressColor = Colors.accent;

  return (
    <View style={[gaugeStyles.container, { width: size, height: size }]}>
      <View
        style={[
          gaugeStyles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: Colors.border,
          },
        ]}
      />
      <View style={gaugeStyles.arcOverlay}>
        <View
          style={[
            gaugeStyles.arcFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: progressColor,
              borderRightColor: clamped > 25 ? progressColor : 'transparent',
              borderBottomColor: clamped > 50 ? progressColor : 'transparent',
              borderLeftColor: clamped > 75 ? progressColor : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
      <View style={gaugeStyles.center}>
        <Text style={gaugeStyles.percentText}>{Math.round(clamped)}%</Text>
        <Text style={gaugeStyles.unitText}>目标进度</Text>
        {goalLabel && goalEmoji ? (
          <Text style={gaugeStyles.goalText}>
            {goalEmoji} {goalLabel}
          </Text>
        ) : null}
        {targetBodyFat != null ? (
          <Text style={gaugeStyles.targetText}>目标体脂 {targetBodyFat}%</Text>
        ) : null}
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  track: { position: 'absolute' },
  arcOverlay: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 9999 },
  arcFill: { position: 'absolute' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center', gap: 2 },
  percentText: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900', lineHeight: 32 },
  unitText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  goalText: { color: Colors.accent, fontSize: 12, fontWeight: '900', marginTop: 2 },
  targetText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
});

/* ---- Main Screen ---- */

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [showReevalModal, setShowReevalModal] = useState(false);

  const { profile, isReady: profileReady } = useUserProfile();

  // ---- dashboard state ----
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [trainingDone, setTrainingDone] = useState(false);
  const [dietKcal, setDietKcal] = useState(0);
  const [dietTarget, setDietTarget] = useState(0);
  const [weightVal, setWeightVal] = useState<number | null>(null);

  // ---- load all dashboard data ----
  const loadDashboard = useCallback(async () => {
    const today = todayKey();
    try {
      const [rawC, rawT, rawD, rawW] = await Promise.all([
        AsyncStorage.getItem(CK.checkin),
        AsyncStorage.getItem(CK.training),
        AsyncStorage.getItem(CK.diet),
        AsyncStorage.getItem(CK.weight),
      ]);
      // checkin
      if (rawC) {
        const c = JSON.parse(rawC);
        setCheckedIn(c.date === today);
        setStreak(c.streak ?? 0);
      }
      // training
      if (rawT) {
        const t = JSON.parse(rawT);
        setTrainingDone(t.date === today && !!t.completed);
      }
      // diet
      if (rawD) {
        const d = JSON.parse(rawD);
        if (d.date === today) setDietKcal(d.kcal ?? 0);
      }
      // weight
      if (rawW) {
        const w = JSON.parse(rawW);
        if (w.date === today) setWeightVal(w.weight ?? null);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // diet target from profile
  useEffect(() => {
    if (profile?.targetKcal) setDietTarget(profile.targetKcal);
  }, [profile?.targetKcal]);

  // ---- check-in ----
  const handleCheckin = useCallback(async () => {
    const today = todayKey();
    try {
      const raw = await AsyncStorage.getItem(CK.checkin);
      let prev = raw ? JSON.parse(raw) : { date: '', streak: 0, totalDays: 0 };
      if (prev.date === today) return;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yk = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
      const newStreak = prev.date === yk ? prev.streak + 1 : 1;
      const next = { date: today, streak: newStreak, totalDays: (prev.totalDays ?? 0) + 1 };
      await AsyncStorage.setItem(CK.checkin, JSON.stringify(next));
      setCheckedIn(true);
      setStreak(newStreak);
    } catch { /* noop */ }
  }, []);

  // ---- progress computation ----
  const progressPercent = useMemo(() => {
    if (!profile?.targetBodyFat || !profile?.weightKg) return 0;
    const currentWeight = weightVal ?? profile.weightKg;
    const leanMass = currentWeight * 0.78; // rough lean estimate
    const targetWeight = leanMass / (1 - profile.targetBodyFat / 100);
    const startWeight = profile.weightKg;
    if (targetWeight >= startWeight) {
      // bulking or maintaining
      return startWeight > 0 ? Math.min(100, Math.max(0, (currentWeight / targetWeight) * 100 * 0.5)) : 0;
    }
    const total = startWeight - targetWeight;
    const lost = startWeight - currentWeight;
    return total > 0 ? Math.min(100, Math.max(0, (lost / total) * 100)) : 0;
  }, [profile?.targetBodyFat, profile?.weightKg, weightVal]);

  // ---- computed ----
  const goalInfo = useMemo(() => {
    if (!profile?.goal) return null;
    return goalDesc[profile.goal] ?? null;
  }, [profile?.goal]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return '早上好';
    if (hour < 17) return '下午好';
    return '晚上好';
  }, []);

  const dateStr = useMemo(() => {
    const now = new Date();
    const week = ['日', '一', '二', '三', '四', '五', '六'];
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${week[now.getDay()]}`;
  }, []);

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== 'Home') navigation.navigate(tab);
  };

  return (
    <>
      <ScreenContainer style={styles.screen} scroll contentStyle={styles.scrollContent}>
        {/* 问候行 */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>{greeting}，战士</Text>
            <Text style={styles.greetingDate}>{dateStr}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setShowReevalModal(true)}
            style={styles.reevalLink}
          >
            <Text style={styles.reevalLinkText}>重新评估</Text>
            <Ionicons name="chevron-forward" size={10} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 打卡签到 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCheckin}
          disabled={checkedIn}
          style={[styles.checkinBtn, checkedIn && styles.checkinBtnDone]}
        >
          <Ionicons
            name={checkedIn ? 'checkmark-circle' : 'flame'}
            size={22}
            color={checkedIn ? Colors.success : Colors.accent}
          />
          <View style={styles.checkinBody}>
            <Text style={[styles.checkinLabel, checkedIn && styles.checkinLabelDone]}>
              {checkedIn ? '已打卡 ✓' : '今日打卡'}
            </Text>
            <Text style={styles.checkinStreak}>
              🔥 连续 {streak} 天
            </Text>
          </View>
        </TouchableOpacity>

        {/* 今日概览 3 卡片 */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewIcon}>🏋️</Text>
            <Text style={styles.overviewValue}>{trainingDone ? '已完成' : '未开始'}</Text>
            <Text style={styles.overviewLabel}>训练</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewIcon}>🥗</Text>
            <Text style={styles.overviewValue}>
              {dietTarget > 0 ? `${dietKcal}/${dietTarget}` : '--'}
            </Text>
            <Text style={styles.overviewLabel}>kcal</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewIcon}>⚖️</Text>
            <Text style={styles.overviewValue}>
              {weightVal != null ? `${weightVal}kg` : '未记录'}
            </Text>
            <Text style={styles.overviewLabel}>体重</Text>
          </View>
        </View>

        {/* 进度环 */}
        <View style={styles.gaugeWrap}>
          <CircularGauge
            percent={progressPercent}
            size={150}
            strokeWidth={10}
            goalLabel={goalInfo?.label}
            goalEmoji={goalInfo?.emoji}
            targetBodyFat={profile?.targetBodyFat}
          />
        </View>

        {/* 快捷入口 */}
        <Text style={styles.sectionTitle}>快捷入口</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Training')}
            style={styles.quickBtn}
          >
            <Ionicons name="barbell" size={20} color={Colors.accent} />
            <Text style={styles.quickLabel}>训练计划</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Diet')}
            style={styles.quickBtn}
          >
            <Ionicons name="restaurant" size={20} color={Colors.accent} />
            <Text style={styles.quickLabel}>饮食记录</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Progress')}
            style={styles.quickBtn}
          >
            <Ionicons name="trending-up" size={20} color={Colors.accent} />
            <Text style={styles.quickLabel}>数据追踪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScreenContainer>

      {/* FAB - 体态分析 */}
      <View pointerEvents="box-none" style={styles.fabWrap}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (!profileReady || !profile) return;
            navigation.navigate('PhotoAssess', {
              basicInfo: {
                age: profile.age,
                height: profile.heightCm,
                weight: profile.weightKg,
                gender: profile.gender,
              },
            });
          }}
          style={[styles.fab, (!profileReady || !profile) && { opacity: 0.4 }]}
          disabled={!profileReady || !profile}
        >
          <Ionicons name="body-outline" size={24} color={Colors.bg} />
          <Text style={styles.fabLabel}>体态分析</Text>
        </TouchableOpacity>
      </View>

      {/* 重新评估弹窗 */}
      <Modal visible={showReevalModal} transparent animationType="fade">
        <View style={styles.reevalOverlay}>
          <View style={styles.reevalCard}>
            <Text style={styles.reevalTitle}>确认重新评估</Text>
            <Text style={styles.reevalDesc}>
              重新评估将覆盖你当前的体态数据（身高、体重、年龄等），已有训练记录不会丢失。
            </Text>
            <View style={styles.reevalBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowReevalModal(false)}
                style={styles.reevalCancelBtn}
              >
                <Text style={styles.reevalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setShowReevalModal(false);
                  navigation.navigate('BasicInfo');
                }}
                style={styles.reevalConfirmBtn}
              >
                <Text style={styles.reevalConfirmText}>确认重新评估</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 底部导航 */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={({ pressed }) => [styles.tabItem, isActive && styles.tabItemActive, pressed && styles.tabItemPressed]}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? Colors.surface : Colors.textDim}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

/* ---- Styles ---- */

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  scrollContent: { paddingBottom: 110, gap: 18 },

  /* greeting */
  greetingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greetingText: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900' },
  greetingDate: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  reevalLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reevalLinkText: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },

  /* checkin */
  checkinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.card, borderWidth: 3, borderColor: Colors.border,
    backgroundColor: Colors.surface, padding: 16,
  },
  checkinBtnDone: {
    borderColor: Colors.success, opacity: 0.75,
  },
  checkinBody: { flex: 1, gap: 2 },
  checkinLabel: { color: Colors.textPrimary, fontSize: 17, fontWeight: '900' },
  checkinLabelDone: { color: Colors.success },
  checkinStreak: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },

  /* overview cards */
  overviewRow: { flexDirection: 'row', gap: 10 },
  overviewCard: {
    flex: 1, ...cardBorderSmall, padding: 14, alignItems: 'center', gap: 4,
  },
  overviewIcon: { fontSize: 22 },
  overviewValue: { color: Colors.textPrimary, fontSize: 15, fontWeight: '900' },
  overviewLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },

  /* gauge */
  gaugeWrap: { alignItems: 'center', paddingVertical: 8 },

  /* quick actions */
  sectionTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '900' },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: Radius.button, borderWidth: 3, borderColor: Colors.border,
    backgroundColor: Colors.surface, paddingVertical: 14,
  },
  quickLabel: { color: Colors.textPrimary, fontSize: 13, fontWeight: '800' },

  bottomSpacer: { height: 18 },

  /* fab */
  fabWrap: {
    position: 'absolute', right: Spacing.screenPaddingH, bottom: 100,
    alignItems: 'center', zIndex: 50,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  fabLabel: { color: Colors.bg, fontSize: 10, fontWeight: '700', marginTop: 4 },

  /* reeval modal */
  reevalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.screenPaddingH,
  },
  reevalCard: {
    width: '100%', maxWidth: 360, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceElevated,
    padding: 20, gap: 12,
  },
  reevalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '900' },
  reevalDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  reevalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  reevalCancelBtn: {
    flex: 1, borderRadius: Radius.button, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.surface,
  },
  reevalCancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  reevalConfirmBtn: {
    flex: 1, borderRadius: Radius.button, backgroundColor: Colors.accent,
    paddingVertical: 12, alignItems: 'center',
  },
  reevalConfirmText: { color: Colors.bg, fontSize: 14, fontWeight: '800' },

  /* tab bar */
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', paddingTop: 10, paddingBottom: 18,
    paddingHorizontal: Spacing.screenPaddingH,
    backgroundColor: Colors.surface, borderTopWidth: 4, borderTopColor: Colors.border,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 0,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: Radius.button,
  },
  tabItemActive: { backgroundColor: Colors.accent },
  tabItemPressed: { opacity: 0.7 },
  tabLabel: { ...Typography.micro, color: Colors.textDim, letterSpacing: 0 },
  tabLabelActive: { color: Colors.surface },
});
