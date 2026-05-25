import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
  isCustom?: boolean;
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const allDone = useMemo(() => exercises.every((item) => item.done), [exercises]);

  const toggleDone = (id: string) => {
    setExercises((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const toggleOpen = (id: string) => {
    setExercises((current) => current.map((item) => (item.id === id ? { ...item, open: !item.open } : item)));
  };

  const handleAdd = () => {
    const name = newName.trim();
    const plan = newPlan.trim();
    if (!name || !plan) return;

    const customExercise: Exercise = {
      id: `custom_${Date.now()}`,
      name,
      plan,
      desc: newDesc.trim() || '自定义动作',
      done: false,
      open: false,
      isCustom: true,
    };

    setExercises((prev) => [customExercise, ...prev]);
    setNewName('');
    setNewPlan('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader title="今日训练" subtitle="按顺序完成今天的动作，勾选后会同步训练状态。" />

      {/* 加号按钮 */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowAddModal(true)}
        style={styles.addBtn}
      >
        <Ionicons name="add" size={20} color={Colors.emberButtonText} />
        <Text style={styles.addBtnText}>自定义动作</Text>
      </TouchableOpacity>

      <View style={styles.list}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHead}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => toggleDone(exercise.id)} style={styles.checkRow}>
                <View style={[styles.checkbox, exercise.done && styles.checkboxActive]}>
                  {exercise.done ? <Ionicons name="checkmark" size={12} color={Colors.goldButtonText} /> : null}
                </View>
                <View style={styles.exerciseCopy}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.isCustom ? (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>⚡自定义</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.exercisePlan}>{exercise.plan}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.exerciseActions}>
                {exercise.isCustom ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleRemove(exercise.id)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={14} color={Colors.textDim} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity activeOpacity={0.8} onPress={() => toggleOpen(exercise.id)} style={styles.expandButton}>
                  <Ionicons name={exercise.open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gold} />
                </TouchableOpacity>
              </View>
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

      {/* 添加动作弹窗 */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>添加自定义动作</Text>

            <Text style={styles.inputLabel}>动作名称</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="如：引体向上"
              placeholderTextColor={Colors.textDim}
            />

            <Text style={styles.inputLabel}>组数 × 次数</Text>
            <TextInput
              style={styles.modalInput}
              value={newPlan}
              onChangeText={setNewPlan}
              placeholder="如：4 组 x 8 次"
              placeholderTextColor={Colors.textDim}
            />

            <Text style={styles.inputLabel}>动作说明（选填）</Text>
            <TextInput
              style={[styles.modalInput, styles.modalDescInput]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="如：控制节奏，全程保持核心稳定"
              placeholderTextColor={Colors.textDim}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => { setShowAddModal(false); setNewName(''); setNewPlan(''); setNewDesc(''); }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAdd}
                style={[styles.modalConfirmBtn, (!newName.trim() || !newPlan.trim()) && { opacity: 0.4 }]}
                disabled={!newName.trim() || !newPlan.trim()}
              >
                <Text style={styles.modalConfirmText}>添加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    borderStyle: 'dashed',
    paddingVertical: 12,
    backgroundColor: Colors.emberLight,
  },
  addBtnText: {
    color: Colors.ember,
    fontSize: 13,
    fontWeight: '800',
  },
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
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  customBadgeText: {
    color: Colors.ember,
    fontSize: 9,
    fontWeight: '800',
  },
  exercisePlan: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: Radius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: Radius.button,
    backgroundColor: Colors.emberButton,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.emberButtonText,
    fontSize: 14,
    fontWeight: '800',
  },
});
