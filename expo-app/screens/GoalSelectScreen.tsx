import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalSelect'>;

const goals = [
  { key: 'lean',   title: '精瘦型',     desc: '降低脂肪感，轮廓更清晰',         icon: 'body-outline' as const },
  { key: 'muscle', title: '肌肉型',     desc: '增加围度，强调力量感',           icon: 'barbell-outline' as const },
  { key: 'line',   title: '线条型',     desc: '保留轻盈感，突出线条',           icon: 'trending-up-outline' as const },
  { key: 'vshape', title: '宽肩倒三角', desc: '塑造上宽下窄的比例',             icon: 'triangle-outline' as const },
  { key: 'glute',  title: '翘臀腿型',   desc: '强化臀腿与下肢形态',             icon: 'walk-outline' as const },
  { key: 'sport',  title: '运动表现型', desc: '兼顾力量、爆发与耐力',           icon: 'trophy-outline' as const },
] as const;

export default function GoalSelectScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<(typeof goals)[number]['key'] | null>(null);

  return (
    <ScreenContainer>
      <SectionHeader title="选择你的目标" subtitle="选一个更接近你的理想身材，后面会据此生成训练和饮食方案。" />

      <View style={styles.grid}>
        {goals.map((goal) => {
          const isActive = selected === goal.key;
          return (
            <TouchableOpacity
              key={goal.key}
              activeOpacity={0.85}
              onPress={() => setSelected(goal.key)}
              style={[styles.goalCard, isActive && styles.goalCardActive]}
            >
              <View style={[styles.goalIconWrap, isActive && styles.goalIconWrapActive]}>
                <Ionicons name={goal.icon} size={22} color={isActive ? Colors.goldButtonText : Colors.gold} />
              </View>
              <View style={styles.goalCopy}>
                <Text style={[styles.goalTitle, isActive && styles.goalTitleActive]}>{goal.title}</Text>
                <Text style={[styles.goalDesc, isActive && styles.goalDescActive]}>{goal.desc}</Text>
              </View>
              {isActive && (
                <View style={styles.checkMark}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <PrimaryButton
        label="继续"
        disabled={!selected}
        onPress={() => navigation.navigate('PhotoAssess')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.cardGap,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 14,
    gap: 12,
  },
  goalCardActive: {
    borderColor: Colors.goldMuted,
    backgroundColor: Colors.goldLight,
  },
  goalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
  },
  goalIconWrapActive: {
    backgroundColor: Colors.gold,
  },
  goalCopy: {
    flex: 1,
    gap: 3,
  },
  goalTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  goalTitleActive: {
    color: Colors.gold,
  },
  goalDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  goalDescActive: {
    color: Colors.textMuted,
  },
  checkMark: {
    marginLeft: 4,
  },
});
