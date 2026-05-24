import { Platform, StyleSheet, Text, View } from 'react-native';

import { Typography } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
};

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
    fontWeight: '900',
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
