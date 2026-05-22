import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/GlassCard';
import { Colors, Typography, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type TabKey = 'Home' | 'Training' | 'Diet' | 'Progress';

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Home',      label: '首页', icon: 'home-outline',        activeIcon: 'home' },
  { key: 'Training',  label: '训练', icon: 'barbell-outline',     activeIcon: 'barbell' },
  { key: 'Diet',      label: '饮食', icon: 'restaurant-outline',  activeIcon: 'restaurant' },
  { key: 'Progress',  label: '进度', icon: 'trending-up-outline', activeIcon: 'trending-up' },
];

/* ── Bento Grid 快捷入口 ── */
const quickActions = [
  { key: 'Training',   icon: 'barbell-outline' as const,     title: '训练',   desc: '动作 · 组数 · 完成' },
  { key: 'Diet',       icon: 'restaurant-outline' as const,  title: '饮食',   desc: '热量 · 蛋白 · 三餐' },
  { key: 'PhotoAssess',icon: 'camera-outline' as const,      title: '体态',   desc: '拍照评估变化' },
  { key: 'GoalSelect', icon: 'flag-outline' as const,        title: '目标',   desc: '调整健身目标' },
];

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return '早上好';
    if (hour < 17) return '下午好';
    return '晚上好';
  }, []);

  const dateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }, []);

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== 'Home') navigation.navigate(tab);
  };

  return (
    <ScreenContainer style={styles.screenFull}>
      {/* ═══ Hero 头部 — 精密排版 ═══ */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{dateStr}</Text>
        <Text style={styles.heroGreeting}>
          {greeting} <Text style={styles.heroWave}>👋</Text>
        </Text>
        <Text style={styles.heroSub}>继续推进你的训练、饮食和体态记录</Text>
      </View>

      {/* ═══ 统计卡片 — Revolut式大数字 ═══ */}
      <View style={styles.statsRow}>
        {[
          { value: '12', unit: '天', label: '连续打卡',     icon: 'flame-outline' as const },
          { value: '78', unit: '%', label: '今日饮食完成',  icon: 'restaurant-outline' as const },
          { value: '4',  unit: '组', label: '本周训练',     icon: 'barbell-outline' as const },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={14} color={Colors.textDim} style={styles.statIcon} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ═══ 今日概览 — 横排卡片 ═══ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>今日概览</Text>
        <GlassCard style={styles.overviewCard} contentGap={14}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewIconWrap}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            </View>
            <View style={styles.overviewTextWrap}>
              <Text style={styles.overviewTitle}>训练已完成</Text>
              <Text style={styles.overviewNote}>今日强度适中，继续保持节奏</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>1680 / 2200 千卡</Text>
            <Text style={styles.progressLabelText}>76%</Text>
          </View>
        </GlassCard>
      </View>

      {/* ═══ Bento Grid 快捷入口 — 2×2 ═══ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>快捷操作</Text>
        <View style={styles.bentoGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              activeOpacity={0.88}
              onPress={() => navigation.navigate(action.key as any)}
            >
              <GlassCard style={styles.bentoCell} noEdgeHighlight contentGap={6}>
                <Ionicons name={action.icon} size={20} color={Colors.gold} />
                <Text style={styles.bentoTitle}>{action.title}</Text>
                <Text style={styles.bentoDesc}>{action.desc}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* spacer for fixed tab bar */}
      <View style={styles.tabSpacer} />

      {/* ═══ 底部导航 — 毛玻璃 + 金色选中态 ═══ */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.key)}
              style={styles.tabItem}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={21}
                color={isActive ? Colors.gold : Colors.textDim}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.tabDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

// ═══════════════════════════════════════════
// 样式 — 暗金精工 Bento Grid
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  screenFull: { paddingBottom: 0 },

  // ── Hero ──
  hero: { gap: 4, paddingTop: 4, marginBottom: 4 },
  heroKicker: { ...Typography.micro, color: Colors.textMuted, letterSpacing: 1.5 },
  heroGreeting: {
    fontSize: 26, fontWeight: '600' as const, lineHeight: 32,
    color: Colors.textPrimary, letterSpacing: -0.5,
  },
  heroWave: { fontSize: 22 },
  heroSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },

  // ── 统计卡片 — 大数字 ──
  statsRow: {
    flexDirection: 'row', gap: Spacing.cardGap,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 14,
    gap: 4,
  },
  statIcon: { marginBottom: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  statValue: { ...Typography.stat, fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  statUnit: { ...Typography.caption, color: Colors.textMuted },
  statLabel: { ...Typography.micro, color: Colors.textDim },

  // ── 今日概览 ──
  section: { gap: 10 },
  sectionLabel: {
    ...Typography.caption, color: Colors.textMuted,
    fontWeight: '600' as const, letterSpacing: 1,
    textTransform: 'uppercase',
  },
  overviewCard: {
    // GlassCard 自带 padding/border/radius
  },
  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overviewIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(39,166,68,0.10)',
  },
  overviewTextWrap: { flex: 1, gap: 2 },
  overviewTitle: {
    fontSize: 15, fontWeight: '600' as const, color: Colors.textPrimary,
    letterSpacing: -0.1,
  },
  overviewNote: { ...Typography.caption, color: Colors.textSecondary },
  progressTrack: {
    height: 3, borderRadius: 1.5,
    backgroundColor: Colors.bgInput,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as any, width: '76%' as any,
    borderRadius: 1.5,
    backgroundColor: Colors.goldButton,
  },
  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  progressLabelText: { ...Typography.micro, color: Colors.textDim },

  // ── Bento Grid 2×2 ──
  bentoGrid: {
    flexDirection: 'row', flexWrap: 'wrap' as const, gap: 10,
  },
  bentoCell: {
    width: '48%' as any, flexGrow: 1, flexBasis: '46%' as any,
    // GlassCard 自带 padding/border/radius
  },
  bentoTitle: {
    fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary,
    letterSpacing: -0.1, marginTop: 2,
  },
  bentoDesc: { ...Typography.micro, color: Colors.textMuted, letterSpacing: 0 },

  // ── TabBar ──
  tabSpacer: { height: 72 },
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    paddingTop: 8, paddingBottom: 20,
    paddingHorizontal: Spacing.screenPaddingH,
    backgroundColor: 'rgba(16,14,11,0.94)',
    borderTopWidth: 1,
    borderTopColor: Colors.goldBorder,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabLabel: { ...Typography.micro, color: Colors.textDim, letterSpacing: 0 },
  tabLabelActive: { color: Colors.gold },
  tabDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.gold, marginTop: -2,
  },
});
