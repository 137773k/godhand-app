import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors, Radius, shadowHard } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

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
        <ActivityIndicator size="small" color="#FFFDF6" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 4,
    borderColor: Colors.border,
    paddingVertical: 16,
    ...shadowHard,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: '#FFFDF6',
    fontSize: 16,
    fontWeight: '800',
  },
});
