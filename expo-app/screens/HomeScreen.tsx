import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenContainer from '../components/ScreenContainer';
import MonsterBattle from '../components/MonsterBattle';
import VictoryModal from '../components/VictoryModal';
import XpPopup from '../components/XpPopup';
import useGameState from '../hooks/useGameState';
import { Colors, emberGradient, Radius, Spacing, Typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type TabKey = 'Home' | 'Training' | 'Diet' | 'Progress';

type TaskItem = {
  id: string;
  xp: number;
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  label: string;
};

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Home', label: '首页', icon: 'home-outline', activeIcon: 'home' },
  { key: 'Training', label: '训练', icon: 'barbell-outline', activeIcon: 'barbell' },
  { key: 'Diet', label: '饮食', icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { key: 'Progress', label: '数据', icon: 'trending-up-outline', activeIcon: 'trending-up' },
];

const tasks: TaskItem[] = [
  {
    id: 'workout',
    xp: 120,
    icon: '🏋️',
    iconBg: Colors.emberLight,
    title: '胸 + 三头训练',
    desc: '平板卧推 · 上斜哑铃 · 绳索下压 · 6 动作',
    label: '16:00 · 力量',
  },
  {
    id: 'lunch',
    xp: 50,
    icon: '🥗',
    iconBg: 'rgba(46,168,74,0.12)',
    title: '高蛋白午餐',
    desc: '鸡胸肉 + 糙米 + 西兰花 · 约 580 kcal',
    label: '午餐 · 饮食',
  },
  {
    id: 'photo',
    xp: 80,
    icon: '📸',
    iconBg: 'rgba(94,106,210,0.12)',
    title: '周度体型记录',
    desc: '正面 / 侧面 / 背面 · AI 自动标注体态',
    label: '每周 · 记录',
  },
];

type PopupState = {
  visible: boolean;
  amount: number;
  x: number;
  y: number;
};

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [victoryVisible, setVictoryVisible] = useState(false);
  const [xpPopup, setXpPopup] = useState<PopupState | null>(null);
  const defeatedRef = useRef(false);
  const hydratedRef = useRef(false);

  const {
    state,
    monster,
    isReady,
    xpProgress,
    completeTask,
    damageMonster,
  } = useGameState();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return '早上好';
    if (hour < 17) return '下午好';
    return '晚上好';
  }, []);

  const dateStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  }, []);

  const completedCount = useMemo(
    () => tasks.filter(task => state.completedTasks.includes(task.id)).length,
    [state.completedTasks],
  );

  useEffect(() => {
    if (!isReady) return;
    if (hydratedRef.current && state.monsterDefeated && !defeatedRef.current) {
      setVictoryVisible(true);
    }
    defeatedRef.current = state.monsterDefeated;
    hydratedRef.current = true;
  }, [isReady, state.monsterDefeated]);

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== 'Home') navigation.navigate(tab);
  };

  const handleTaskPress = (task: TaskItem, pageX: number, pageY: number) => {
    if (state.completedTasks.includes(task.id)) return;

    setXpPopup({
      visible: true,
      amount: task.xp,
      x: pageX - Spacing.screenPaddingH,
      y: pageY - insets.top - Spacing.screenPaddingTop,
    });

    completeTask(task.id, task.xp);
  };

  const handleMonsterAttack = (damage: number) => {
    damageMonster(damage);
  };

  if (!isReady) {
    return (
      <ScreenContainer style={styles.screen} scroll={false}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingTitle}>战斗档案加载中</Text>
          <Text style={styles.loadingSub}>正在唤醒怪兽系统与本地存档</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} scroll={false}>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>{dateStr}</Text>
            <Text style={styles.heroTitle}>
              {greeting}，战士
            </Text>
            <Text style={styles.heroSub}>锻造身体 · 击杀弱点</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('BasicInfo')}
              style={styles.reevaluateBtn}
            >
              <Ionicons name="body-outline" size={14} color={Colors.ember} />
              <Text style={styles.reevaluateText}>重新评估身体数据</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.textDim} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusStrip}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{state.level}</Text>
            </View>
            <View style={styles.xpWrap}>
              <View style={styles.xpTrack}>
                <LinearGradient
                  colors={emberGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.xpFill, { width: `${Math.max(0, Math.min(1, xpProgress)) * 100}%` }]}
                />
              </View>
              <Text style={styles.xpText}>{state.xp} / {state.xpToNext} XP</Text>
            </View>
          </View>

          <View style={styles.monsterSection}>
            <MonsterBattle
              monster={monster}
              monsterIndex={state.monsterIdx}
              currentHP={state.monsterHP}
              maxHP={state.monsterMaxHP}
              defeated={state.monsterDefeated}
              rewardXP={monster.rewardXP}
              rewardGem={monster.rewardGem}
              onAttack={handleMonsterAttack}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.streak}</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.totalDays}</Text>
              <Text style={styles.statLabel}>累计击败</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.gems}</Text>
              <Text style={styles.statLabel}>💎 宝石</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日待战</Text>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{completedCount}/{tasks.length}</Text>
            </View>
          </View>

          <View style={styles.taskList}>
            {tasks.map(task => {
              const done = state.completedTasks.includes(task.id);
              return (
                <Pressable
                  key={task.id}
                  onPress={event => handleTaskPress(task, event.nativeEvent.pageX, event.nativeEvent.pageY)}
                  style={({ pressed }) => [styles.taskCard, done && styles.taskCardDone, pressed && !done && styles.taskCardPressed]}
                >
                  <View style={[styles.taskIcon, { backgroundColor: task.iconBg }]}>
                    <Text style={styles.taskEmoji}>{task.icon}</Text>
                  </View>
                  <View style={styles.taskBody}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDesc}>{task.desc}</Text>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskMeta}>{task.label}</Text>
                      <Text style={styles.taskMetaXP}>+{task.xp} XP</Text>
                    </View>
                  </View>
                  <View style={styles.taskState}>
                    {done ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    ) : (
                      <View style={styles.taskXPBadge}>
                        <Text style={styles.taskXPText}>战斗</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View pointerEvents="box-none" style={styles.overlayLayer}>
          <XpPopup
            visible={Boolean(xpPopup?.visible)}
            amount={xpPopup?.amount ?? 0}
            x={xpPopup?.x ?? 0}
            y={xpPopup?.y ?? 0}
            onComplete={() => setXpPopup(null)}
          />
        </View>

        <VictoryModal
          visible={victoryVisible}
          monster={monster}
          rewardXP={monster.rewardXP}
          rewardGem={monster.rewardGem}
          onClose={() => setVictoryVisible(false)}
        />

        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? Colors.ember : Colors.textDim}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                {isActive ? <View style={styles.tabDot} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  root: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 110,
    gap: 18,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  loadingSub: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  hero: {
    gap: 4,
  },
  kicker: {
    ...Typography.micro,
    color: Colors.textMuted,
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  reevaluateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.emberLight,
  },
  reevaluateText: {
    color: Colors.ember,
    fontSize: 12,
    fontWeight: '700',
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    minWidth: 74,
    height: 42,
    borderRadius: Radius.button,
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  levelText: {
    color: Colors.emberButtonText,
    fontSize: 16,
    fontWeight: '900',
  },
  xpWrap: {
    flex: 1,
    gap: 5,
  },
  xpTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 999,
  },
  xpText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  monsterSection: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  progressPillText: {
    color: Colors.emberButtonText,
    fontSize: 11,
    fontWeight: '900',
  },
  taskList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  taskCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  taskCardDone: {
    opacity: 0.72,
    borderColor: 'rgba(46,168,74,0.22)',
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskBody: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  taskDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  taskMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  taskMetaXP: {
    color: Colors.ember,
    fontSize: 12,
    fontWeight: '900',
  },
  taskState: {
    width: 48,
    alignItems: 'flex-end',
  },
  taskXPBadge: {
    minWidth: 42,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  taskXPText: {
    color: Colors.emberButtonText,
    fontSize: 10,
    fontWeight: '900',
  },
  bottomSpacer: {
    height: 18,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: Spacing.screenPaddingH,
    backgroundColor: 'rgba(16, 13, 10, 0.96)',
    borderTopWidth: 1,
    borderTopColor: Colors.emberBorder,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabItemPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    ...Typography.micro,
    color: Colors.textDim,
    letterSpacing: 0,
  },
  tabLabelActive: {
    color: Colors.ember,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ember,
  },
});
