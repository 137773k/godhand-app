import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { Colors, Radius } from '../theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  /** 模糊强度（默认20），iOS液态玻璃范围15-25 */
  intensity?: number;
  /** 玻璃底色透明度层（在BlurView之上） */
  tint?: 'dark' | 'extraDark';
  /** 不显示顶部高光（玻璃边缘反光） */
  noEdgeHighlight?: boolean;
  /** 内容区内部间距（默认16） */
  contentPadding?: number;
  /** 内容区gap */
  contentGap?: number;
};

/**
 * GlassCard — iOS式液态玻璃卡片
 *
 * 底层BlurView模糊渐变背景 → 半透叠加层 → 玻璃边缘高光
 * 模拟iOS控制中心/通知中心的毛玻璃质感
 */
export default function GlassCard({ children, style, intensity = 20, tint = 'dark', noEdgeHighlight, contentPadding = 16, contentGap }: Props) {
  const overlayColor = tint === 'extraDark' ? 'rgba(14,12,10,0.50)' : 'rgba(22,20,17,0.35)';

  return (
    <View style={[styles.wrapper, style]}>
      {/* 底层毛玻璃模糊 */}
      <BlurView
        intensity={intensity}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
      />
      {/* 半透叠加层 — 控制透出的底色量 */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} pointerEvents="none" />
      {/* 玻璃边缘高光（顶边微亮） */}
      {!noEdgeHighlight && <View style={styles.edgeHighlight} pointerEvents="none" />}
      {/* 内容 */}
      <View style={[styles.content, { padding: contentPadding, gap: contentGap }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  // 玻璃顶部高光 — 模拟光源打在玻璃表面的反射
  edgeHighlight: {
    position: 'absolute',
    top: 0, left: 1, right: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 2,
  },
  content: {
    padding: 16,
    zIndex: 1,
  },
});
