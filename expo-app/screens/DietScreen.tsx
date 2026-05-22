import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Diet'>;

const meals = [
  { key: 'breakfast', title: '早餐', foods: '燕麦、鸡蛋、无糖酸奶', kcal: '480 千卡', protein: '32g' },
  { key: 'lunch',     title: '午餐', foods: '米饭、鸡胸肉、西兰花',   kcal: '620 千卡', protein: '46g' },
  { key: 'dinner',    title: '晚餐', foods: '土豆、牛肉、菠菜',       kcal: '410 千卡', protein: '34g' },
  { key: 'snack',     title: '加餐', foods: '香蕉、乳清蛋白',         kcal: '170 千卡', protein: '22g' },
] as const;

export default function DietScreen({ navigation }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader title="今日饮食" subtitle="按目标热量和蛋白质分配三餐与加餐，先看整体进度。" />

      {/* 热量进度卡片 */}
      <View style={styles.card}>
        <View style={styles.progressTop}>
          <Text style={styles.sectionTitle}>热量进度</Text>
          <Text style={styles.progressText}>1680 / 2200 千卡</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressHint}>已完成约 76%，剩余 520 千卡。</Text>
      </View>

      {/* 餐食列表 */}
      <View style={styles.mealList}>
        {meals.map((meal) => (
          <View key={meal.key} style={styles.mealCard}>
            <View style={styles.mealHead}>
              <Text style={styles.mealTitle}>{meal.title}</Text>
              <Ionicons name="nutrition-outline" size={18} color={Colors.gold} />
            </View>
            <Text style={styles.mealFoods}>{meal.foods}</Text>
            <View style={styles.mealMetaRow}>
              <Text style={styles.mealMeta}>{meal.kcal}</Text>
              <Text style={styles.mealMeta}>{meal.protein}</Text>
            </View>
          </View>
        ))}
      </View>

      {added ? (
        <Text style={styles.statusText}>已打开食物添加占位流程。</Text>
      ) : (
        <Text style={styles.statusText}> </Text>
      )}

      <PrimaryButton label="添加食物" onPress={() => setAdded(true)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 16,
    gap: Spacing.cardGap,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  progressText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '76%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.goldButton,
  },
  progressHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  mealList: {
    gap: Spacing.cardGap,
  },
  mealCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 14,
    gap: Spacing.inlineGap,
  },
  mealHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  mealFoods: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  mealMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mealMeta: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    minHeight: 18,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
