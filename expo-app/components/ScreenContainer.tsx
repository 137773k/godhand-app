import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing } from '../theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** 关闭渐变背景（登录页等自己管理背景的页面） */
  noGradient?: boolean;
};

/**
 * 统一页面容器 — 暖褐渐变底色 + 氛围光斑 + SafeArea
 * v5: 叠加微渐变使背景有"呼吸感"，不是死纯色
 */
export default function ScreenContainer({ children, scroll = true, style, contentStyle, noGradient }: Props) {
  const inner = (
    <View style={[styles.fixedPadding, contentStyle]}>
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  ) : (
    <View style={styles.scrollInner}>{inner}</View>
  );

  // 无渐变模式：纯色底（用于登录页等自己管理背景的页面）
  if (noGradient) {
    return <SafeAreaView style={[styles.screen, style]}>{body}</SafeAreaView>;
  }

  return (
    <View style={styles.screenFull}>
      {/* 微渐变层 — 顶微亮→底深 */}
      <LinearGradient
        colors={[Colors.gradientTop, Colors.gradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* 暖光斑 — 左上 */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      {/* 暖光斑 — 右下 */}
      <View style={styles.glowBottomRight} pointerEvents="none" />

      <SafeAreaView style={[styles.screen, style]}>
        {body}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenFull: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',   // 渐变层在下，容器透明
  },
  scrollInner: {
    flexGrow: 1,
  },
  fixedPadding: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.screenPaddingTop,
    paddingBottom: Spacing.screenPaddingBottom,
    gap: Spacing.sectionGap,
  },
  // 暖光斑 — 大面积超低透明度，制造"模糊光源"感（v6 提亮）
  glowTopLeft: {
    position: 'absolute',
    left: '-25%', top: '-12%',
    width: '90%', height: '65%',
    borderRadius: 999,
    backgroundColor: 'rgba(218, 174, 92, 0.035)',
  },
  glowBottomRight: {
    position: 'absolute',
    right: '-20%', bottom: '-8%',
    width: '80%', height: '55%',
    borderRadius: 999,
    backgroundColor: 'rgba(200, 156, 68, 0.028)',
  },
});
