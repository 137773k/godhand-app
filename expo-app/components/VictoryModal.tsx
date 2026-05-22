import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, Radius } from '../theme';
import type { Monster } from '../hooks/useGameState';

type Props = {
  visible: boolean;
  monster: Monster;
  rewardXP: number;
  rewardGem: number;
  onClose: () => void;
};

export default function VictoryModal({ visible, monster, rewardXP, rewardGem, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.8);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>{monster.emoji}</Text>
          <Text style={styles.title}>击败成功</Text>
          <Text style={styles.subtitle}>{monster.name} 已被你击溃</Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardValue}>+{rewardXP}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </View>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardValue}>+{rewardGem}</Text>
              <Text style={styles.rewardLabel}>💎</Text>
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>继续战斗</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 7, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    padding: 24,
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    alignItems: 'center',
    shadowColor: Colors.ember,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  emoji: {
    fontSize: 68,
    lineHeight: 76,
    marginBottom: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 22,
  },
  rewardBox: {
    minWidth: 96,
    borderRadius: Radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgDeep,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    alignItems: 'center',
  },
  rewardValue: {
    color: Colors.ember,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
  },
  rewardLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  button: {
    minHeight: 50,
    width: '100%',
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emberButton,
  },
  buttonText: {
    color: Colors.emberButtonText,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
