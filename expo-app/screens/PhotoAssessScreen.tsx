import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoAssess'>;
type CaptureTab = 'front' | 'side' | 'back';

const tabs: Array<{ key: CaptureTab; label: string; hint: string }> = [
  { key: 'front', label: '正面', hint: '双脚站稳，双臂自然下垂' },
  { key: 'side', label: '侧面', hint: '身体侧转 90°，保持躯干放松' },
  { key: 'back', label: '背面', hint: '肩胛自然展开，脚跟并拢' },
];

const assessmentResult = {
  bodyFat: 28,
  muscleMass: 32,
  bmi: 26.8,
  posture: '轻度圆肩，骨盆前倾',
} as const;

export default function PhotoAssessScreen({ navigation, route }: Props) {
  const [activeTab, setActiveTab] = useState<CaptureTab>('front');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const basicInfo = route.params?.basicInfo;
  const activeMeta = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab],
  );

  useEffect(() => {
    if (!isAnalyzing) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [isAnalyzing, pulse]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const frameOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  const handleAnalyze = () => {
    if (isAnalyzing) return;

    timeoutsRef.current.forEach(clearTimeout);

    setIsAnalyzing(true);
    setAnalysisDone(false);

    const finishTimer = setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisDone(true);
    }, 2400);

    timeoutsRef.current = [finishTimer];
  };

  const infoText = basicInfo
    ? `年龄 ${basicInfo.age} 岁 · 身高 ${basicInfo.height}cm · 体重 ${basicInfo.weight}kg · 采集三视角体态数据`
    : '采集三视角体态数据';

  return (
    <ScreenContainer>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        <Text style={styles.backText}>返回</Text>
      </TouchableOpacity>

      <SectionHeader title="体态分析" subtitle={infoText} />

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.9}
              disabled={isAnalyzing}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.captureCard}>
        <View style={styles.captureHeader}>
          <View>
            <Text style={styles.captureTitle}>{activeMeta.label} 采集位</Text>
            <Text style={styles.captureHint}>{activeMeta.hint}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MOCK</Text>
          </View>
        </View>

        <Animated.View style={[styles.captureFrame, isAnalyzing && { opacity: frameOpacity }]}>
          <View style={styles.frameInner}>
            <Ionicons name="scan-outline" size={36} color={Colors.ember} />
            <Text style={styles.frameTitle}>{activeMeta.label} 占位框</Text>
            <Text style={styles.frameText}>后续接入相机与人体关键点识别</Text>
          </View>
        </Animated.View>

        <View style={styles.captureFoot}>
          <Text style={styles.captureFootText}>建议穿贴身运动服，站在明亮纯色背景前</Text>
        </View>
      </View>

      <View style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>分析引擎</Text>
          {isAnalyzing ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={Colors.ember} />
              <Text style={styles.statusText}>分析中</Text>
            </View>
          ) : analysisDone ? (
            <Text style={styles.statusDone}>完成</Text>
          ) : (
            <Text style={styles.statusIdle}>待开始</Text>
          )}
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingTitle}>正在比对三视角体态特征</Text>
            <Text style={styles.loadingText}>扫描肩线、骨盆角度、脂肪分布与躯干比例...</Text>
          </View>
        ) : analysisDone ? (
          <View style={styles.resultGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>体脂率</Text>
              <Text style={styles.metricValue}>28%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>肌肉量</Text>
              <Text style={styles.metricValue}>32kg</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={styles.metricValue}>26.8</Text>
            </View>
            <View style={[styles.metricCard, styles.postureCard]}>
              <Text style={styles.metricLabel}>体态评估</Text>
              <Text style={styles.postureText}>轻度圆肩，骨盆前倾</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.idleText}>完成三视角采集后，将输出体脂、肌肉量、BMI 与体态风险。</Text>
        )}
      </View>

      <PrimaryButton
        label={analysisDone ? '查看分析结果' : '开始分析'}
        loading={isAnalyzing}
        onPress={analysisDone ? () => navigation.navigate('Home') : handleAnalyze}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginBottom: -4,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.82,
  },
  tabButtonActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.emberLight,
    opacity: 1,
  },
  tabLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: Colors.ember,
  },
  captureCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: Spacing.cardGap,
    gap: Spacing.cardGap,
  },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
  },
  captureTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  captureHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.microGap,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.emberLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: Colors.ember,
    fontSize: 11,
    fontWeight: '700',
  },
  captureFrame: {
    minHeight: 300,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  frameInner: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.ember,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emberLight,
    gap: Spacing.tightGap,
  },
  frameTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  frameText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  captureFoot: {
    paddingHorizontal: Spacing.inlineGap,
  },
  captureFootText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  analysisCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    padding: Spacing.cardGap,
    gap: Spacing.cardGap,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
  },
  analysisTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.inlineGap,
  },
  statusText: {
    color: Colors.ember,
    fontSize: 12,
    fontWeight: '700',
  },
  statusDone: {
    color: Colors.ember,
    fontSize: 12,
    fontWeight: '700',
  },
  statusIdle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    borderRadius: Radius.card,
    backgroundColor: Colors.bgCardRaised,
    padding: 16,
    gap: Spacing.tightGap,
  },
  loadingTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.cardGap,
  },
  metricCard: {
    width: '47%',
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: 14,
    gap: Spacing.microGap,
  },
  postureCard: {
    width: '100%',
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  postureText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  idleText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
