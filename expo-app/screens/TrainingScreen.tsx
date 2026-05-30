import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { cardBorderSmall, Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Training'>;

// --------------- types ---------------

type ExerciseStep = { emoji: string; text: string };

type ExerciseDef = {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  steps: ExerciseStep[];
  warnings: string[];
  desc: string;
};

type ExerciseState = { id: string; done: boolean };

type Category = 'home' | 'gym' | 'outdoor';

const CATEGORIES: { key: Category; emoji: string; label: string }[] = [
  { key: 'home', emoji: '🏠', label: '居家训练' },
  { key: 'gym', emoji: '🏋️', label: '健身房' },
  { key: 'outdoor', emoji: '🌳', label: '徒手户外' },
];

// --------------- built-in library ---------------

const HOME_EXERCISES: ExerciseDef[] = [
  {
    id: 'home_1', name: '俯卧撑', targetMuscle: '胸肌·肱三头肌·三角肌前束',
    sets: 4, reps: '12-15次',
    steps: [
      { emoji: '🧍', text: '双手略宽于肩，身体呈一条直线' },
      { emoji: '⬇️', text: '屈肘缓慢下放，胸部接近地面' },
      { emoji: '⏸️', text: '底部稍停顿，保持核心收紧' },
      { emoji: '⬆️', text: '用力推起，肘关节不要锁死' },
    ],
    warnings: ['塌腰/臀部过高 — 保持身体呈一条直线', '手肘过度外展 — 肘部与身体呈45°角', '半程动作 — 胸贴地但不触地'],
    desc: '经典上肢推力动作，主要训练胸大肌、肱三头肌和三角肌前束。双手间距略宽于肩，身体从头到脚保持平板状，屈肘下放至胸部几乎触地，然后发力推起。核心收紧防止塌腰，肘部与躯干呈约45°夹角以保护肩关节。',
  },
  {
    id: 'home_2', name: '深蹲', targetMuscle: '股四头肌·臀大肌',
    sets: 4, reps: '15-20次',
    steps: [
      { emoji: '🧍', text: '双脚与肩同宽，脚尖微外展' },
      { emoji: '⬇️', text: '屈髋屈膝，像坐椅子一样下蹲' },
      { emoji: '⏸️', text: '大腿与地面平行时停顿' },
      { emoji: '⬆️', text: '臀腿发力站起，膝盖勿内扣' },
    ],
    warnings: ['膝盖内扣 — 膝盖始终与脚尖同向', '脚跟离地 — 重心放在全脚掌', '弓背 — 保持腰背挺直中立位'],
    desc: '下肢基础动作，全面刺激股四头肌、腘绳肌和臀大肌。双脚与肩同宽或略宽，保持腰背挺直，下蹲时髋膝联动，像坐椅子一样向后向下。膝盖与脚尖同向，核心全程收紧。建议下蹲至大腿平行或略低于平行。',
  },
  {
    id: 'home_3', name: '平板支撑', targetMuscle: '核心·腹横肌',
    sets: 3, reps: '30-60秒',
    steps: [
      { emoji: '🧎', text: '肘部撑地，与肩同宽' },
      { emoji: '⬆️', text: '脚尖着地，身体抬离地面' },
      { emoji: '⏸️', text: '保持身体呈一条直线' },
      { emoji: '😮‍💨', text: '均匀呼吸，收紧腹部' },
    ],
    warnings: ['臀部过高或塌陷 — 身体保持平板状', '耸肩 — 肩胛骨下沉远离耳朵', '憋气 — 保持自然均匀呼吸'],
    desc: '经典核心稳定性训练，主要激活腹横肌、腹直肌和多裂肌。前臂撑地，肘关节位于肩正下方，从头部到脚跟呈一条直线。保持臀部不塌陷也不抬高，腹部持续收紧，正常呼吸不要憋气。从30秒开始逐渐增加时长。',
  },
  {
    id: 'home_4', name: '臀桥', targetMuscle: '臀大肌·腘绳肌',
    sets: 3, reps: '15-20次',
    steps: [
      { emoji: '🧎', text: '仰卧屈膝，双脚平放地面' },
      { emoji: '⬆️', text: '臀部收紧向上抬起' },
      { emoji: '⏸️', text: '顶峰收缩2秒，感受臀部发力' },
      { emoji: '⬇️', text: '缓慢下放，臀部不触地' },
    ],
    warnings: ['用腰代偿 — 感受臀部而非腰部发力', '幅度不够 — 抬至肩-髋-膝成直线', '速度过快 — 控制节奏2秒上2秒下'],
    desc: '臀部激活与强化动作，有效刺激臀大肌和腘绳肌。仰卧屈膝，双脚平踏地面与髋同宽，收紧臀部将髋部向上推起至肩-髋-膝呈直线。顶部主动收缩臀肌停留1-2秒，然后控制下放但不完全触地，保持臀肌持续受力。',
  },
  {
    id: 'home_5', name: '登山者', targetMuscle: '核心·髋屈肌·心肺',
    sets: 3, reps: '30秒',
    steps: [
      { emoji: '🧎', text: '俯卧撑起始姿势' },
      { emoji: '🏃', text: '交替提膝向胸部方向' },
      { emoji: '⚡', text: '保持快速节奏' },
      { emoji: '😮‍💨', text: '核心收紧，身体稳定不晃动' },
    ],
    warnings: ['臀部过高 — 保持身体与地面平行', '身体晃动 — 核心收紧减少侧摆', '速度过快失控 — 先慢后快逐步提速'],
    desc: '动态核心与心肺训练，在俯卧撑姿势基础上交替将膝盖向胸部方向提拉。保持上半身稳定，避免臀部上下起伏。交替速度可逐步加快，核心持续收紧减少身体横向摆动。每组持续30-60秒。',
  },
];

const GYM_EXERCISES: ExerciseDef[] = [
  {
    id: 'gym_1', name: '杠铃卧推', targetMuscle: '胸大肌·肱三头肌·三角肌前束',
    sets: 4, reps: '8-12次',
    steps: [
      { emoji: '🧎', text: '仰卧长凳，眼睛位于杠铃正下方' },
      { emoji: '⬇️', text: '握距略宽于肩，缓慢下放至胸部' },
      { emoji: '⏸️', text: '轻触胸部后稍作停顿' },
      { emoji: '⬆️', text: '用力推起至手臂伸直' },
    ],
    warnings: ['半程推举 — 杠铃触胸后再推起', '肩部前伸 — 保持肩胛骨收紧贴凳', '握距过宽 — 小臂垂直地面'],
    desc: '上肢推力王牌动作，主要刺激胸大肌、肱三头肌和三角肌前束。仰卧平板凳，双脚踏实地面，肩胛骨收紧下沉。握距约为肩宽1.5倍，下放时肘部与身体呈45-75°。杠铃下降至轻触胸部中下部，然后发力推起，全程保持五点接触（头、肩背、臀、双脚）。',
  },
  {
    id: 'gym_2', name: '高位下拉', targetMuscle: '背阔肌·大圆肌·肱二头肌',
    sets: 4, reps: '10-12次',
    steps: [
      { emoji: '🧍', text: '坐姿，大腿固定在护垫下' },
      { emoji: '⬇️', text: '宽握横杆，下拉至锁骨位置' },
      { emoji: '⏸️', text: '底部挤压背阔肌1秒' },
      { emoji: '⬆️', text: '控制放回，感受背部拉伸' },
    ],
    warnings: ['借力后仰 — 身体勿过度后倾', '用二头代偿 — 意念集中在背部', '动作过快 — 控制离心阶段'],
    desc: '背部宽度发展的核心动作，主要训练背阔肌和大圆肌。坐姿大腿固定，握距约肩宽1.5倍，身体微后倾10-15°。下拉时肩胛骨先下沉再屈肘，意念集中在肘关节向下后方移动。横杆拉至锁骨上方，挤压背部肌群后控制返回。',
  },
  {
    id: 'gym_3', name: '深蹲(杠铃)', targetMuscle: '股四头肌·臀大肌·核心',
    sets: 5, reps: '6-10次',
    steps: [
      { emoji: '🧍', text: '杠铃置于斜方肌上，双脚肩宽' },
      { emoji: '⬇️', text: '屈髋屈膝下蹲，保持腰背挺直' },
      { emoji: '⏸️', text: '大腿低于水平线稍停' },
      { emoji: '⬆️', text: '臀腿发力站起，膝盖勿锁死' },
    ],
    warnings: ['膝盖内扣 — 膝盖推向外侧', '脚跟抬起 — 重心在全脚掌', '过度前倾 — 保持胸挺起'],
    desc: '下肢力量之王，杠铃置于斜方肌上部（高杠位），双脚略宽于肩，脚尖微外展。下蹲时髋膝联动，保持腰背刚性中立，深度至少至大腿平行或更低。起立时保持胸挺起、膝盖外推，髋部和肩部同步上升。核心全程支撑保护脊柱。',
  },
  {
    id: 'gym_4', name: '罗马尼亚硬拉', targetMuscle: '腘绳肌·臀大肌·竖脊肌',
    sets: 4, reps: '8-10次',
    steps: [
      { emoji: '🧍', text: '双脚与髋同宽，握距略宽于腿' },
      { emoji: '⬇️', text: '微屈膝，臀部后推，杠铃贴腿下滑' },
      { emoji: '⏸️', text: '至小腿中段，感受腘绳肌拉伸' },
      { emoji: '⬆️', text: '臀部前推站起，杠铃贴身还原' },
    ],
    warnings: ['弓背 — 保持腰背平直', '杠铃远离身体 — 始终贴腿运动', '膝盖过度弯曲 — 保持微屈不变'],
    desc: '后链王牌动作，重点训练腘绳肌、臀大肌和竖脊肌。与常规硬拉不同，罗马尼亚硬拉从站立开始，膝盖保持微屈（约10-15°）基本不变。臀部向后推杠铃沿大腿下滑，腰背始终保持刚性平直。下降至腘绳肌有明显拉伸感即可（通常至小腿中段），然后臀部前推还原。',
  },
  {
    id: 'gym_5', name: '坐姿划船', targetMuscle: '背阔肌·菱形肌·肱二头肌',
    sets: 4, reps: '10-12次',
    steps: [
      { emoji: '🧎', text: '坐姿，双脚踩实踏板' },
      { emoji: '⬅️', text: '双手拉把手至腹部' },
      { emoji: '⏸️', text: '夹紧肩胛骨1秒' },
      { emoji: '➡️', text: '控制放回，手臂不完全伸直' },
    ],
    warnings: ['身体大幅后仰 — 上身稳定微后倾', '耸肩 — 肩部下沉远离耳朵', '惯性借力 — 控制全程速度'],
    desc: '背部厚度的核心动作，主要刺激背阔肌、菱形肌和中下斜方肌。坐姿双脚踩实，身体保持稳定微后倾。拉动手柄时先后收肩胛骨，然后屈肘将手柄拉向腹部。肘关节贴近身体两侧，顶峰充分收缩背部肌群。返回时控制速度，肘关节不完全伸直以保持肌肉张力。',
  },
];

const OUTDOOR_EXERCISES: ExerciseDef[] = [
  {
    id: 'outdoor_1', name: '引体向上', targetMuscle: '背阔肌·肱二头肌·核心',
    sets: 4, reps: '6-10次',
    steps: [
      { emoji: '🧍', text: '正握单杠，握距略宽于肩' },
      { emoji: '⬆️', text: '背肌发力，身体上拉至下巴过杠' },
      { emoji: '⏸️', text: '顶部停顿1秒' },
      { emoji: '⬇️', text: '控制下放至手臂完全伸展' },
    ],
    warnings: ['借力摆荡 — 身体保持稳定不晃', '半程动作 — 下放至手臂完全伸直', '过度用二头 — 意念集中在背部'],
    desc: '上肢拉力之王，自重训练的核心动作。双手正握单杠，握距略宽于肩，悬垂时肩胛骨下沉。发力时先下沉再后收肩胛，然后屈肘将身体拉起。意念集中在肘关节向下后方移动，下巴超过杠面。控制下放至手臂完全伸直但不放松肩部。',
  },
  {
    id: 'outdoor_2', name: '双杠臂屈伸', targetMuscle: '胸大肌·肱三头肌·三角肌前束',
    sets: 4, reps: '8-12次',
    steps: [
      { emoji: '🧍', text: '双手撑杠，手臂伸直支撑身体' },
      { emoji: '⬇️', text: '屈肘缓慢下放，身体微前倾' },
      { emoji: '⏸️', text: '上臂与地面平行时停顿' },
      { emoji: '⬆️', text: '三头/胸发力推起' },
    ],
    warnings: ['肩部过度下放 — 上臂不低过平行', '身体过直 — 微前倾刺激胸肌', '肘关节锁死 — 顶部保留微屈'],
    desc: '上肢推力自重动作，同时训练胸大肌和肱三头肌。双手撑于双杠，手臂伸直支撑身体。下放时屈肘，身体微前倾（刺激胸肌为主）或保持直立（刺激三头为主）。下降至上臂与地面平行即停，避免肩关节过度伸展。推起时保持控制，顶部肘关节不完全锁死。',
  },
  {
    id: 'outdoor_3', name: '波比跳', targetMuscle: '全身·心肺',
    sets: 4, reps: '10-15次',
    steps: [
      { emoji: '🧍', text: '站立姿势' },
      { emoji: '⬇️', text: '下蹲，双手撑地' },
      { emoji: '🦘', text: '双脚后跳至俯卧撑位' },
      { emoji: '⬆️', text: '跳回后全力向上跳起' },
    ],
    warnings: ['核心松散 — 全程保持腹肌收紧', '落地过硬 — 屈膝缓冲保护关节', '速度过快变形 — 先保证动作质量'],
    desc: '全身燃脂与心肺训练标杆动作。从站立开始，快速下蹲双手撑地，双脚跳回至俯卧撑姿势（可选做俯卧撑），然后跳回并爆发性向上跳起，双手过头。全程核心收紧，落地时屈膝缓冲。适合HIIT训练，每组10-15次或计时30-45秒。',
  },
  {
    id: 'outdoor_4', name: '弓步蹲', targetMuscle: '股四头肌·臀大肌·核心',
    sets: 4, reps: '每侧10-12次',
    steps: [
      { emoji: '🧍', text: '双脚前后站立，间距约一腿长' },
      { emoji: '⬇️', text: '后膝下降接近地面' },
      { emoji: '⏸️', text: '双膝均呈90°时停顿' },
      { emoji: '⬆️', text: '前腿发力推回起始位' },
    ],
    warnings: ['前膝超脚尖 — 前膝不超过脚踝', '身体前倾 — 保持上身直立', '后膝撞地 — 轻触即起'],
    desc: '单侧下肢训练，有效改善左右不平衡并强化稳定肌群。双脚前后分开约一腿长距离，前脚全掌着地，后脚前掌撑地。下蹲时保持上身垂直于地面，前膝不超过脚踝，后膝向地面轻触。前腿主导发力推回起始位置。可握哑铃增加负重。',
  },
  {
    id: 'outdoor_5', name: '冲刺跑', targetMuscle: '心肺·腿部爆发力',
    sets: 6, reps: '50-100米',
    steps: [
      { emoji: '🧍', text: '起跑姿势，重心前倾' },
      { emoji: '🏃', text: '全力冲刺，高抬腿' },
      { emoji: '💨', text: '摆臂有力，步频加快' },
      { emoji: '🧊', text: '完成一组后步行恢复' },
    ],
    warnings: ['热身不足 — 充分动态拉伸后再冲刺', '步幅过大 — 保持高步频小步幅', '急停 — 冲刺后逐渐减速'],
    desc: '速度与爆发力训练，有效提升心肺功能和快肌纤维募集能力。选择平坦安全的路面（跑道/草地/沙滩最佳）。起跑时重心前倾，加速阶段保持高步频和有力摆臂。冲刺距离50-100米，组间以步行方式充分恢复（约1:3-1:5的工作休息比）。务必充分热身预防拉伤。',
  },
];

const EXERCISE_MAP: Record<Category, ExerciseDef[]> = {
  home: HOME_EXERCISES,
  gym: GYM_EXERCISES,
  outdoor: OUTDOOR_EXERCISES,
};

// --------------- helpers ---------------

const STORAGE_KEY = 'today_training_v1';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// --------------- component ---------------

export default function TrainingScreen({ navigation }: Props) {
  const [category, setCategory] = useState<Category>('home');
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [customExercises, setCustomExercises] = useState<ExerciseDef[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // --------------- load state ---------------

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.date === todayKey()) {
            setExercises(data.exercises ?? []);
            if (data.completed) setSubmitted(true);
          }
        }
      } catch { /* noop */ }
      setLoaded(true);
    })();
  }, []);

  // --------------- save ---------------

  const saveState = useCallback(
    async (nextExercises: ExerciseState[], nextSubmitted: boolean) => {
      const payload = {
        date: todayKey(),
        completed: nextSubmitted,
        exercises: nextExercises,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    [],
  );

  // --------------- derived ---------------

  const builtInDefs = EXERCISE_MAP[category];

  const mergedExercises: (ExerciseState & { def?: ExerciseDef })[] = useMemo(() => {
    const builtIn = builtInDefs.map((d) => {
      const found = exercises.find((e) => e.id === d.id);
      return { id: d.id, done: found?.done ?? false, def: d };
    });
    const customs = customExercises.map((d) => {
      const found = exercises.find((e) => e.id === d.id);
      return { id: d.id, done: found?.done ?? false, def: d };
    });
    return [...builtIn, ...customs];
  }, [builtInDefs, customExercises, exercises]);

  const allDone = useMemo(() => mergedExercises.length > 0 && mergedExercises.every((e) => e.done), [mergedExercises]);

  // --------------- actions ---------------

  const toggleDone = useCallback(
    (id: string) => {
      setExercises((prev) => {
        const exists = prev.find((e) => e.id === id);
        const next = exists
          ? prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e))
          : [...prev, { id, done: true }];
        saveState(next, false);
        return next;
      });
    },
    [saveState],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = mergedExercises.map((e) => e.id);
    setExpandedIds(new Set(allIds.length === expandedIds.size ? [] : allIds));
  }, [mergedExercises, expandedIds]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: todayKey(), completed: true, exercises }),
    );
  }, [exercises]);

  const handleAdd = useCallback(() => {
    const name = newName.trim();
    const plan = newPlan.trim();
    if (!name || !plan) return;

    const def: ExerciseDef = {
      id: `custom_${Date.now()}`,
      name,
      targetMuscle: '自定义',
      sets: parseInt(plan) || 0,
      reps: plan,
      steps: [],
      warnings: [],
      desc: newDesc.trim() || '自定义动作',
    };

    setCustomExercises((prev) => [def, ...prev]);
    setNewName('');
    setNewPlan('');
    setNewDesc('');
    setShowAddModal(false);
  }, [newName, newPlan, newDesc]);

  const handleRemoveCustom = useCallback((id: string) => {
    setCustomExercises((prev) => prev.filter((e) => e.id !== id));
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // --------------- render ---------------

  const renderTabs = () => (
    <View style={styles.tabRow}>
      {CATEGORIES.map((c) => {
        const active = category === c.key;
        return (
          <TouchableOpacity
            key={c.key}
            activeOpacity={0.85}
            onPress={() => setCategory(c.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={styles.tabEmoji}>{c.emoji}</Text>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{c.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCard = (item: ExerciseState & { def?: ExerciseDef }) => {
    const def = item.def;
    if (!def) return null;
    const isExpanded = expandedIds.has(item.id);
    const isCustom = def.id.startsWith('custom_');

    return (
      <View key={item.id} style={styles.card}>
        {/* ---- header ---- */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => toggleDone(item.id)}
            style={styles.checkRow}
          >
            <View style={[styles.checkbox, item.done && styles.checkboxActive]}>
              {item.done ? <Ionicons name="checkmark" size={14} color={Colors.bg} /> : null}
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.exerciseName}>{def.name}</Text>
                {isCustom && (
                  <View style={styles.customBadge}>
                    <Text style={styles.customBadgeText}>自定义</Text>
                  </View>
                )}
              </View>
              <Text style={styles.targetMuscle}>{def.targetMuscle}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <Text style={styles.planText}>
              {def.sets}组 × {def.reps}
            </Text>
            {isCustom && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRemoveCustom(item.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="trash-outline" size={14} color={Colors.textDim} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleExpand(item.id)}
              style={styles.expandBtn}
            >
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---- expanded body ---- */}
        {isExpanded && (
          <View style={styles.cardBody}>
            {/* steps */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                {'📸'} 慢动作示范
              </Text>
              {def.steps.length > 0 ? (
                def.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepEmoji}>{step.emoji}</Text>
                    <Text style={styles.stepIndex}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noContent}>无示范步骤</Text>
              )}
            </View>

            {/* warnings */}
            {def.warnings.length > 0 && (
              <View style={styles.warningBlock}>
                <Text style={styles.warningTitle}>
                  {'⚠️'} 易伤点位
                </Text>
                {def.warnings.map((w, i) => (
                  <View key={i} style={styles.warningRow}>
                    <Text style={styles.warningDot}>{'●'}</Text>
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* description */}
            <Text style={styles.descText}>{def.desc}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader
        title="今日训练"
        subtitle="选择分类，按顺序完成动作，勾选后同步训练状态。"
      />

      {/* category tabs */}
      {renderTabs()}

      {/* expand/collapse all */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={expandAll}
        style={styles.expandAllBtn}
      >
        <Ionicons
          name={expandedIds.size === mergedExercises.length ? 'contract' : 'expand'}
          size={14}
          color={Colors.accent}
        />
        <Text style={styles.expandAllText}>
          {expandedIds.size === mergedExercises.length ? '全部收起' : '全部展开'}
        </Text>
      </TouchableOpacity>

      {/* exercise list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {mergedExercises.map(renderCard)}
      </ScrollView>

      {/* add custom button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowAddModal(true)}
        style={styles.addBtn}
      >
        <Ionicons name="add" size={20} color={Colors.bg} />
        <Text style={styles.addBtnText}>自定义动作</Text>
      </TouchableOpacity>

      {/* status */}
      {submitted ? (
        <Text style={styles.statusText}>训练已提交，数据已同步。</Text>
      ) : (
        <Text style={styles.statusText}> </Text>
      )}

      {/* complete button */}
      <PrimaryButton
        label={allDone ? '完成训练' : '完成训练'}
        onPress={handleSubmit}
      />

      {/* ---- add modal ---- */}
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
              placeholder="如：4组 x 8次"
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
                onPress={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setNewPlan('');
                  setNewDesc('');
                }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAdd}
                style={[
                  styles.modalConfirmBtn,
                  (!newName.trim() || !newPlan.trim()) && { opacity: 0.4 },
                ]}
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

// --------------- styles ---------------

const styles = StyleSheet.create({
  // tabs
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: Radius.button,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Platform.select({ ios: {}, default: { elevation: 0 } }),
  },
  tabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.bg,
  },

  // expand all
  expandAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  expandAllText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },

  // list
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.cardGap,
    paddingBottom: 8,
  },

  // card
  card: {
    ...cardBorderSmall,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  checkRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.checkbox,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: Colors.tag,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customBadgeText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
  },
  targetMuscle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: Radius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },

  // card body
  cardBody: {
    gap: 14,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  stepEmoji: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  stepIndex: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 16,
  },
  stepText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  noContent: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // warnings
  warningBlock: {
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.danger,
    backgroundColor: '#FFF5F5',
  },
  warningTitle: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 2,
  },
  warningDot: {
    color: Colors.danger,
    fontSize: 8,
    marginTop: 4,
  },
  warningText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  // description
  descText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },

  // add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.button,
    borderWidth: 3,
    borderColor: Colors.accent,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
  },
  addBtnText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '800',
  },

  // status
  statusText: {
    minHeight: 18,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  // modal
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
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
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
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
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
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '800',
  },
});
