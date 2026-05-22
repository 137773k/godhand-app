import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../theme';

type Props = {
  icon?: string;
  title: string;
  message?: string;
};

/**
 * 空状态占位 — 列表为空或暂无数据时使用
 */
export default function EmptyState({ icon = '📭', title, message }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  icon: {
    fontSize: 36,
    marginBottom: 4,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
