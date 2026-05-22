import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
};

/**
 * 页面标题区 — 大字标题 + 金色副标题线
 */
export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.hero}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
  },
  title: {
    color: Typography.hero.color,
    fontSize: Typography.hero.fontSize,
    lineHeight: Typography.hero.lineHeight,
    fontWeight: Typography.hero.fontWeight,
    fontFamily: Platform.select({
      ios: 'Arial Black',
      android: 'sans-serif-black',
      default: 'Arial Black',
    }),
  },
  subtitle: {
    color: Typography.subtitle.color,
    fontSize: Typography.subtitle.fontSize,
    lineHeight: Typography.subtitle.lineHeight,
  },
});
