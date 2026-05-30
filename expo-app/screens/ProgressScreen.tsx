import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { cardBorder, cardBorderSmall, Colors, Radius, Spacing, Typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

/* --------------- types --------------- */

type WeightRecord = { date: string; weight: number };
type MeasurementRecord = { date: string; chest: number; waist: number; hip: number; arm: number; thigh: number };
type DietLogEntry = { date: string; kcal: number; protein: number };

const EMPTY_MEASUREMENT: Omit<MeasurementRecord, 'date'> = { chest: 0, waist: 0, hip: 0, arm: 0, thigh: 0 };

/* --------------- storage keys --------------- */

const SK = {
  weight: 'progress_weight_v1',
  measurements: 'progress_measurements_v1',
  trainingLog: 'progress_training_log_v1',
  dietLog: 'progress_diet_log_v1',
  training: 'today_training_v1',
  diet: 'today_diet_v1',
  dietMacros: 'diet_eaten_macros_v1',
} as const;

/* --------------- helpers --------------- */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isInRange(key: string, start: Date, end: Date): boolean {
  const t = parseDate(key).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

const FIELD_LABELS: { key: keyof Omit<MeasurementRecord, 'date'>; label: string }[] = [
  { key: 'chest', label: '胸围' },
  { key: 'waist', label: '腰围' },
  { key: 'hip', label: '臀围' },
  { key: 'arm', label: '臂围' },
  { key: 'thigh', label: '大腿围' },
];

/* --------------- component --------------- */

export default function ProgressScreen({ navigation }: Props) {
  /* ---- weight ---- */
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(() => new Date());

  /* ---- measurements ---- */
  const [measurementRecords, setMeasurementRecords] = useState<MeasurementRecord[]>([]);
  const [measOpen, setMeasOpen] = useState(false);
  const [measDate, setMeasDate] = useState(() => new Date());
  const [measInputs, setMeasInputs] = useState({ chest: '', waist: '', hip: '', arm: '', thigh: '' });

  /* ---- training stats ---- */
  const [trainingDates, setTrainingDates] = useState<string[]>([]);

  /* ---- diet stats ---- */
  const [dietLog, setDietLog] = useState<DietLogEntry[]>([]);

  /* ---- load all data ---- */
  const loadAll = useCallback(async () => {
    try {
      const [rawW, rawM, rawTL, rawDL, rawT, rawD, rawDM] = await Promise.all([
        AsyncStorage.getItem(SK.weight),
        AsyncStorage.getItem(SK.measurements),
        AsyncStorage.getItem(SK.trainingLog),
        AsyncStorage.getItem(SK.dietLog),
        AsyncStorage.getItem(SK.training),
        AsyncStorage.getItem(SK.diet),
        AsyncStorage.getItem(SK.dietMacros),
      ]);

      setWeightRecords(rawW ? JSON.parse(rawW).records ?? [] : []);
      setMeasurementRecords(rawM ? JSON.parse(rawM).records ?? [] : []);

      // --- sync training log ---
      let tDates: string[] = rawTL ? JSON.parse(rawTL) : [];
      const today = todayKey();
      if (rawT) {
        const t = JSON.parse(rawT);
        if (t.date === today && t.completed && !tDates.includes(today)) {
          tDates = [...tDates, today];
          await AsyncStorage.setItem(SK.trainingLog, JSON.stringify(tDates));
        }
      }
      setTrainingDates(tDates);

      // --- sync diet log ---
      let dLog: DietLogEntry[] = rawDL ? JSON.parse(rawDL) : [];
      const todayKcal = rawD ? (JSON.parse(rawD).kcal ?? 0) : 0;
      const todayProtein = rawDM ? (JSON.parse(rawDM).protein ?? 0) : 0;
      const existingIdx = dLog.findIndex((e) => e.date === today);
      if (existingIdx >= 0) {
        dLog[existingIdx] = { date: today, kcal: todayKcal, protein: todayProtein };
      } else if (todayKcal > 0 || todayProtein > 0) {
        dLog = [...dLog, { date: today, kcal: todayKcal, protein: todayProtein }];
      }
      await AsyncStorage.setItem(SK.dietLog, JSON.stringify(dLog));
      setDietLog(dLog);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ---- save weight ---- */
  const saveWeight = useCallback(async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const key = dateKey(weightDate);
    const existing = [...weightRecords];
    const idx = existing.findIndex((r) => r.date === key);
    if (idx >= 0) {
      existing[idx] = { date: key, weight: w };
    } else {
      existing.push({ date: key, weight: w });
    }
    existing.sort((a, b) => a.date.localeCompare(b.date));
    await AsyncStorage.setItem(SK.weight, JSON.stringify({ records: existing }));
    setWeightRecords(existing);
    setWeightInput('');
  }, [weightInput, weightDate, weightRecords]);

  /* ---- save measurements ---- */
  const saveMeasurements = useCallback(async () => {
    const vals = {
      chest: parseFloat(measInputs.chest) || 0,
      waist: parseFloat(measInputs.waist) || 0,
      hip: parseFloat(measInputs.hip) || 0,
      arm: parseFloat(measInputs.arm) || 0,
      thigh: parseFloat(measInputs.thigh) || 0,
    };
    if (Object.values(vals).every((v) => v === 0)) return;
    const key = dateKey(measDate);
    const existing = [...measurementRecords];
    const idx = existing.findIndex((r) => r.date === key);
    const entry: MeasurementRecord = { date: key, ...vals };
    if (idx >= 0) {
      existing[idx] = entry;
    } else {
      existing.push(entry);
    }
    existing.sort((a, b) => a.date.localeCompare(b.date));
    await AsyncStorage.setItem(SK.measurements, JSON.stringify({ records: existing }));
    setMeasurementRecords(existing);
    setMeasInputs({ chest: '', waist: '', hip: '', arm: '', thigh: '' });
  }, [measInputs, measDate, measurementRecords]);

  /* ---- weight chart data ---- */
  const chartData = useMemo(() => {
    const now = new Date();
    const days: { label: string; date: string; weight: number | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1], date: dateKey(d), weight: null });
    }
    for (const r of weightRecords) {
      const hit = days.find((d) => d.date === r.date);
      if (hit) hit.weight = r.weight;
    }
    return days;
  }, [weightRecords]);

  const weightChartMax = useMemo(() => {
    const vals = chartData.map((d) => d.weight).filter((v): v is number => v !== null);
    if (vals.length === 0) return 100;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max === min) return max + 1;
    return max;
  }, [chartData]);

  const weightChartMin = useMemo(() => {
    const vals = chartData.map((d) => d.weight).filter((v): v is number => v !== null);
    if (vals.length === 0) return 0;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max === min) return min - 1;
    return min;
  }, [chartData]);

  const weightChange = useMemo(() => {
    const valid = chartData.filter((d) => d.weight !== null);
    if (valid.length < 2) return null;
    const first = valid[0]!.weight!;
    const last = valid[valid.length - 1]!.weight!;
    return last - first;
  }, [chartData]);

  /* ---- measurement comparison ---- */
  const measComparison = useMemo(() => {
    const recs = measurementRecords;
    if (recs.length === 0) return null;
    const latest = recs[recs.length - 1];
    const prev = recs.length >= 2 ? recs[recs.length - 2] : null;
    return { latest, prev };
  }, [measurementRecords]);

  /* ---- training stats ---- */
  const trainingStats = useMemo(() => {
    const now = new Date();
    const monday = mondayOf(now);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mStart = monthStart(now);
    const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const weekDays = trainingDates.filter((d) => isInRange(d, monday, sunday)).length;
    const monthDays = trainingDates.filter((d) => isInRange(d, mStart, mEnd)).length;

    return { weekDays, monthDays, monthTotal: daysInMonth(now), total: trainingDates.length };
  }, [trainingDates]);

  /* ---- diet stats ---- */
  const dietStats = useMemo(() => {
    const now = new Date();
    const monday = mondayOf(now);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekEntries = dietLog.filter((e) => isInRange(e.date, monday, sunday));
    const avgKcal = weekEntries.length > 0
      ? Math.round(weekEntries.reduce((s, e) => s + e.kcal, 0) / weekEntries.length)
      : 0;

    const proteinGoal = 80; // g/day default
    const proteinHitDays = weekEntries.filter((e) => e.protein >= proteinGoal).length;

    return { avgKcal, proteinHitDays, weekTotal: weekEntries.length, proteinGoal };
  }, [dietLog]);

  /* ---- date nav helpers ---- */
  const shiftDate = useCallback((setter: (d: Date) => void, current: Date, delta: number) => {
    const next = new Date(current);
    next.setDate(next.getDate() + delta);
    setter(next);
  }, []);

  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader title="数据追踪" subtitle="记录体重、围度、训练与饮食趋势。" />

      {/* ========== 1. 体重记录 ========== */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>体重记录</Text>

        {/* date + input + save */}
        <View style={styles.row}>
          <TouchableOpacity onPress={() => shiftDate(setWeightDate, weightDate, -1)} style={styles.dateBtn}>
            <Ionicons name="chevron-back" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{dateKey(weightDate)}</Text>
          </View>
          <TouchableOpacity onPress={() => shiftDate(setWeightDate, weightDate, 1)} style={styles.dateBtn}>
            <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.weightInput}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="kg"
            placeholderTextColor={Colors.textDim}
          />
          <TouchableOpacity onPress={saveWeight} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>记录</Text>
          </TouchableOpacity>
        </View>

        {/* 7-day bar chart */}
        {weightRecords.length > 0 ? (
          <>
            <View style={styles.chartArea}>
              <View style={styles.chartInner}>
                {chartData.map((day) => {
                  const hasVal = day.weight !== null;
                  const range = weightChartMax - weightChartMin || 1;
                  const h = hasVal
                    ? 30 + ((day.weight! - weightChartMin) / range) * 100
                    : 8;
                  return (
                    <View key={day.date} style={styles.chartColumn}>
                      <Text style={styles.chartVal}>
                        {hasVal ? day.weight!.toFixed(1) : '-'}
                      </Text>
                      <View
                        style={[
                          styles.chartBar,
                          { height: h, backgroundColor: hasVal ? Colors.accent : Colors.borderLight, opacity: hasVal ? 1 : 0.35 },
                        ]}
                      />
                      <Text style={styles.chartLabel}>{day.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {weightChange !== null && weightRecords.length >= 2 && (
              <View style={styles.deltaRow}>
                <Ionicons
                  name={weightChange <= 0 ? 'trending-down' : 'trending-up'}
                  size={16}
                  color={weightChange <= 0 ? Colors.success : Colors.danger}
                />
                <Text style={[styles.deltaText, { color: weightChange <= 0 ? Colors.success : Colors.danger }]}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg / 本周
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.chartArea}>
            <Text style={styles.emptyText}>暂无体重数据，记录第一条吧</Text>
          </View>
        )}
      </View>

      {/* ========== 2. 身体围度 (collapsible) ========== */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setMeasOpen(!measOpen)} style={styles.cardHead} activeOpacity={0.7}>
          <Text style={styles.sectionTitle}>身体围度</Text>
          <Ionicons name={measOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {measOpen && (
          <>
            {/* date */}
            <View style={styles.dateRow}>
              <TouchableOpacity onPress={() => shiftDate(setMeasDate, measDate, -1)} style={styles.dateBtn}>
                <Ionicons name="chevron-back" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.datePill}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.dateText}>{dateKey(measDate)}</Text>
              </View>
              <TouchableOpacity onPress={() => shiftDate(setMeasDate, measDate, 1)} style={styles.dateBtn}>
                <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* input fields */}
            {FIELD_LABELS.map((f) => (
              <View key={f.key} style={styles.measRow}>
                <Text style={styles.measLabel}>{f.label}</Text>
                <TextInput
                  style={styles.measInput}
                  value={measInputs[f.key]}
                  onChangeText={(v) => setMeasInputs((prev) => ({ ...prev, [f.key]: v }))}
                  keyboardType="decimal-pad"
                  placeholder="cm"
                  placeholderTextColor={Colors.textDim}
                />
              </View>
            ))}

            <TouchableOpacity onPress={saveMeasurements} style={styles.saveBtnFull}>
              <Text style={styles.saveBtnText}>保存围度</Text>
            </TouchableOpacity>

            {/* latest vs previous comparison */}
            {measComparison && (
              <View style={styles.compBox}>
                <Text style={styles.compTitle}>
                  最近记录 {measComparison.latest.date}
                </Text>
                {FIELD_LABELS.map((f) => {
                  const cur = measComparison.latest[f.key] || 0;
                  const prev = measComparison.prev?.[f.key] || 0;
                  const delta = prev ? cur - prev : 0;
                  return (
                    <View key={f.key} style={styles.compRow}>
                      <Text style={styles.compLabel}>{f.label}</Text>
                      <Text style={styles.compVal}>{cur > 0 ? `${cur}cm` : '-'}</Text>
                      {measComparison.prev && delta !== 0 && (
                        <Text style={[styles.compDelta, { color: delta > 0 ? Colors.info : Colors.success }]}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}cm
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      {/* ========== 3. 训练统计 ========== */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>训练统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {trainingStats.weekDays}<Text style={styles.statDenom}>/7</Text>
            </Text>
            <Text style={styles.statLabel}>本周训练天数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {trainingStats.monthDays}<Text style={styles.statDenom}>/{trainingStats.monthTotal}</Text>
            </Text>
            <Text style={styles.statLabel}>本月训练天数</Text>
          </View>
          <View style={[styles.statCard, styles.statCardFull]}>
            <Text style={styles.statValue}>{trainingStats.total}</Text>
            <Text style={styles.statLabel}>总训练次数</Text>
          </View>
        </View>
      </View>

      {/* ========== 4. 饮食统计 ========== */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>饮食统计</Text>
        <View style={styles.statsRow2}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dietStats.avgKcal > 0 ? dietStats.avgKcal : '-'}
            </Text>
            <Text style={styles.statLabel}>
              {dietStats.avgKcal > 0 ? '本周平均摄入 kcal' : '本周暂无饮食数据'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dietStats.weekTotal > 0
                ? `${Math.round((dietStats.proteinHitDays / dietStats.weekTotal) * 100)}%`
                : '-'}
            </Text>
            <Text style={styles.statLabel}>
              蛋白质达标率 (≥{dietStats.proteinGoal}g/天)
            </Text>
          </View>
        </View>
      </View>

      {/* ========== 5. 照片对比 ========== */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.sectionTitle}>照片对比</Text>
          <Ionicons name="camera-outline" size={18} color={Colors.accent} />
        </View>
        <View style={styles.compareRow}>
          <View style={styles.compareBox}>
            <Ionicons name="image-outline" size={28} color={Colors.textDim} />
            <Text style={styles.compareLabel}>本周前</Text>
          </View>
          <View style={styles.compareBox}>
            <Ionicons name="image-outline" size={28} color={Colors.textDim} />
            <Text style={styles.compareLabel}>本周后</Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

/* --------------- styles --------------- */

const styles = StyleSheet.create({
  /* card */
  card: {
    ...cardBorder,
    padding: 16,
    gap: Spacing.cardGap,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* date */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tightGap,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.microGap,
  },
  dateBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },

  /* weight input */
  weightInput: {
    flex: 1,
    height: 36,
    borderRadius: Radius.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent,
  },
  saveBtnFull: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },

  /* chart */
  chartArea: {
    height: 152,
    ...cardBorderSmall,
    padding: 12,
    justifyContent: 'flex-end',
  },
  chartInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    height: '100%',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBar: {
    width: '100%',
    maxWidth: 26,
    borderRadius: 10,
  },
  chartVal: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  chartLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },

  /* measurements */
  measRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tightGap,
  },
  measLabel: {
    width: 56,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  measInput: {
    flex: 1,
    height: 36,
    borderRadius: Radius.input,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  /* measurement comparison */
  compBox: {
    ...cardBorderSmall,
    padding: 12,
    gap: Spacing.tightGap,
  },
  compTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tightGap,
  },
  compLabel: {
    width: 56,
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  compVal: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  compDelta: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 'auto',
  },

  /* stats */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.tightGap,
  },
  statsRow2: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    ...cardBorderSmall,
    padding: 12,
    gap: 4,
    alignItems: 'center',
  },
  statCardFull: {
    minWidth: '100%',
  },
  statValue: {
    ...Typography.stat,
    fontSize: 26,
    lineHeight: 30,
  },
  statDenom: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },

  /* photo compare */
  compareRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  compareBox: {
    flex: 1,
    height: 124,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.tightGap,
  },
  compareLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
