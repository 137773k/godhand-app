import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import BackButton from '../components/BackButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

const weightBars = [
  { label: '一', h: 48 },
  { label: '二', h: 58 },
  { label: '三', h: 52 },
  { label: '四', h: 66 },
  { label: '五', h: 60 },
  { label: '六', h: 72 },
  { label: '日', h: 68 },
] as const;

export default function ProgressScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <BackButton onPress={() => navigation.navigate('Home')} />
      <SectionHeader title="我的进度" subtitle="记录体重变化、执行率和照片对比，观察每周趋势。" />

      {/* 体重图表 */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.sectionTitle}>体重变化</Text>
          <Text style={styles.cardMeta}>-1.2 kg / 4 周</Text>
        </View>
        <View style={styles.chartArea}>
          <View style={styles.chartInner}>
            {weightBars.map((bar) => (
              <View key={bar.label} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: bar.h }]} />
                <Text style={styles.chartLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 执行率 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>86%</Text>
          <Text style={styles.statLabel}>训练完成率</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>79%</Text>
          <Text style={styles.statLabel}>饮食执行率</Text>
        </View>
      </View>

      {/* 照片对比 */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.sectionTitle}>照片对比</Text>
          <Ionicons name="camera-outline" size={18} color={Colors.gold} />
        </View>
        <View style={styles.compareRow}>
          <View style={styles.compareBox}>
            <Text style={styles.compareLabel}>本周前</Text>
          </View>
          <View style={styles.compareBox}>
            <Text style={styles.compareLabel}>本周后</Text>
          </View>
        </View>
      </View>

      {/* 周报 */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>周报摘要</Text>
        <Text style={styles.summaryText}>本周训练稳定，深蹲和推类动作完成度较高，饮食控制比上周更平衡。</Text>
        <Text style={styles.summaryLine}>· 体重下降趋势保持平稳</Text>
        <Text style={styles.summaryLine}>· 蛋白质摄入接近目标</Text>
        <Text style={styles.summaryLine}>· 下周建议继续保持有氧频率</Text>
      </View>
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
  cardHead: {
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
  cardMeta: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  chartArea: {
    height: 172,
    borderRadius: Radius.card,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(255, 225, 160, 0.06)',
    padding: 12,
    justifyContent: 'flex-end',
  },
  chartInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.inlineGap,
    height: '100%',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.tightGap,
  },
  chartBar: {
    width: '100%',
    maxWidth: 24,
    borderRadius: 10,
    backgroundColor: Colors.goldButton,
  },
  chartLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 14,
    gap: Spacing.tightGap,
  },
  statValue: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  compareRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  compareBox: {
    flex: 1,
    height: 124,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryLine: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
});
