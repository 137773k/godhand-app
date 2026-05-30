import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '../theme';

type Props = {
  onPress: () => void;
  label?: string;
};

export default function BackButton({ onPress, label = '返回首页' }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <Ionicons name="arrow-back" size={18} color={Colors.accent} />
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
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
