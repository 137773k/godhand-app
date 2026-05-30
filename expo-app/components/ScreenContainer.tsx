import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function ScreenContainer({ children, scroll = true, style, contentStyle }: Props) {
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

  return (
    <View style={[styles.bg, style]}>
      <SafeAreaView style={styles.safe}>
        {body}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safe: {
    flex: 1,
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
});
