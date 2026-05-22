import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoAssess'>;

export default function PhotoAssessScreen({ navigation }: Props) {
  const [source, setSource] = useState<'camera' | 'album' | null>(null);

  return (
    <ScreenContainer>
      <SectionHeader
        title="拍照评估"
        subtitle="请拍摄一张正面全身照，光线均匀、站姿自然，便于后续 AI 分析。"
      />

      {/* ── 圆形取景框 ── */}
      <View style={styles.cameraPanel}>
        <View style={styles.frameOuter}>
          <View style={styles.frameInner}>
            <Ionicons name="camera-outline" size={34} color={Colors.gold} />
            <Text style={styles.frameTitle}>取景框占位</Text>
            <Text style={styles.frameText}>后续接入 expo-camera</Text>
          </View>
        </View>
      </View>

      {/* ── 拍照 / 相册 按钮 ── */}
      <View style={styles.buttonRow}>
        <TouchableOpacity activeOpacity={0.88} onPress={() => setSource('camera')} style={styles.secondaryButton}>
          <Ionicons name="camera-outline" size={18} color={Colors.gold} />
          <Text style={styles.secondaryButtonText}>拍照</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.88} onPress={() => setSource('album')} style={styles.secondaryButton}>
          <Ionicons name="images-outline" size={18} color={Colors.gold} />
          <Text style={styles.secondaryButtonText}>从相册选择</Text>
        </TouchableOpacity>
      </View>

      {/* ── 评估结果 ── */}
      <View style={styles.resultCard}>
        <View style={styles.resultHead}>
          <Text style={styles.sectionTitle}>评估结果</Text>
          {source ? (
            <Text style={styles.resultBadge}>
              已选择：{source === 'camera' ? '拍照' : '相册'}
            </Text>
          ) : null}
        </View>
        <Text style={styles.resultText}>
          当前为占位结果，接入识别后这里会显示体态分析、比例建议和动作优先级。
        </Text>
        <View style={styles.resultList}>
          <Text style={styles.resultLine}>· 肩背状态：待分析</Text>
          <Text style={styles.resultLine}>· 腹部脂肪：待分析</Text>
          <Text style={styles.resultLine}>· 下肢比例：待分析</Text>
        </View>
      </View>

      <PrimaryButton label="开始生成方案" onPress={() => navigation.navigate('Home')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cameraPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  frameOuter: {
    width: 248,
    height: 248,
    borderRadius: 124,
    borderWidth: 1,
    borderColor: 'rgba(255, 225, 160, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 21, 24, 0.52)',
  },
  frameInner: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgInput,
  },
  frameTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  frameText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.inlineGap,
  },
  secondaryButtonText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.bgCard,
    padding: 16,
    gap: Spacing.cardGap,
  },
  resultHead: {
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
  resultBadge: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  resultText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  resultList: {
    gap: Spacing.tightGap,
  },
  resultLine: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
});
