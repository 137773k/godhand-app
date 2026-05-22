import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '../theme';

type Props = {
  onPress: () => void;
  label?: string;
};

/**
 * 返回按钮 — 金色箭头 + 可选文字，克制低调
 */
export default function BackButton({ onPress, label = '返回首页' }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <Ionicons name="arrow-back" size={18} color={Colors.gold} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tightGap,
    marginBottom: 2,
  },
  text: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
});
