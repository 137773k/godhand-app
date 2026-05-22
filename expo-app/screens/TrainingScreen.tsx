import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Training'>;

type Exercise = {
  id: string;
  name: string;
  plan: string;
  desc: string;
  done: boolean;
  open: boolean;
};

const initialExercises: Exercise[] = [
  { id: '1', name: '杠铃卧推',   plan: '4 组 x 8 次',   desc: '控制下放速度，保持肩胛稳定，推起时发力均匀。',        done: true,  open: false },
  { id: '2', name: '高位下拉',   plan: '4 组 x 10 次',  desc: '胸部微挺，路径稳定，感受背阔收缩。',                   done: false, open: false },
  { id: '3', name: '深蹲',       plan: '5 组 x 6 次',   desc: '膝盖跟脚尖同向，核心收紧，保持腰背中立。',              done: false, open: false },
  { id: '4', name: '平板支撑',   plan: '3 组 x 60 秒',  desc: '臀部不过高或过低，维持腹压和稳定呼吸。',               done: false, open: false },
];

export default function TrainingScreen({ navigation }: Props) {
  const [exercises, setExercises] = useState(initialExercises);
  const [submitted, setSubmitted] = useState(false);

  const allDone = useMemo(() => exercises.every((item) => item.done), [exercises]);

  const toggleDone = (id: string) => {
    setExercises((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const toggleOpen = (id: string) => {
    setExercises((current) => current.map((item) => (item.id === id ? { ...item, open: !item.open } : item)));
  };

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader title="今日训练" subtitle="按顺序完成今天的动作，勾选后会同步训练状态。" />

      <View style={styles.list}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHead}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => toggleDone(exercise.id)} style={styles.checkRow}>
                <View style={[styles.checkbox, exercise.done && styles.checkboxActive]}>
                  {exercise.done ? <Ionicons name="checkmark" size={12} color={Colors.goldButtonText} /> : null}
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exercisePlan}>{exercise.plan}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={() => toggleOpen(exercise.id)} style={styles.expandButton}>
                <Ionicons name={exercise.open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gold} />
              </TouchableOpacity>
            </View>

            {exercise.open ? <Text style={styles.exerciseDesc}>{exercise.desc}</Text> : null}
          </View>
        ))}
      </View>

      {submitted ? (
        <Text style={styles.statusText}>训练已提交，模拟数据已更新。</Text>
      ) : (
        <Text style={styles.statusText}> </Text>
      )}

      <PrimaryButton label={allDone ? '完成训练' : '完成训练'} onPress={() => setSubmitted(true)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.cardGap,
  },
  exerciseCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 14,
    gap: Spacing.cardGap,
  },
  exerciseHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
  },
  checkRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.cardGap,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.checkbox,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInput,
  },
  checkboxActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  exercisePlan: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldLight,
  },
  exerciseDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  statusText: {
    minHeight: 18,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
