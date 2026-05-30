import { StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '../theme';

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
    ...Typography.h2,
  },
  subtitle: {
    ...Typography.caption,
  },
});
