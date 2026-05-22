import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors, Radius } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * 主操作按钮 — 琥珀金填充 · 9999px全圆角药丸 · 暗底反白文字
 */
export default function PrimaryButton({ label, onPress, disabled, loading }: Props) {
  const isBlocked = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      disabled={isBlocked}
      style={[styles.base, isBlocked && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.goldButtonText} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldButton,
  },
  disabled: {
    opacity: 0.38,
  },
  text: {
    color: Colors.goldButtonText,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
