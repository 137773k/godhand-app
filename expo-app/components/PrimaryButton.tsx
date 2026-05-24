import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors, Radius } from '../theme';

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
        <ActivityIndicator size="small" color={Colors.emberButtonText} />
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
    backgroundColor: Colors.emberButton,
  },
  disabled: {
    opacity: 0.38,
  },
  text: {
    color: Colors.emberButtonText,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
