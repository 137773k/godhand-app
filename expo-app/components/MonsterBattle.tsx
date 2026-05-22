import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, emberGradient } from '../theme';
import type { Monster } from '../hooks/useGameState';
import PixelMonster from './PixelMonster';

type Props = {
  monster: Monster;
  monsterIndex: number;
  currentHP: number;
  maxHP: number;
  defeated: boolean;
  rewardXP: number;
  rewardGem: number;
  onAttack: (damage: number) => void;
};

export default function MonsterBattle({
  monster,
  monsterIndex,
  currentHP,
  maxHP,
  defeated,
  rewardXP,
  rewardGem,
  onAttack,
}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const defeatAnim = useRef(new Animated.Value(defeated ? 1 : 0)).current;
  const prevHP = useRef(currentHP);
  const prevDefeated = useRef(defeated);

  useEffect(() => {
    if (currentHP < prevHP.current && !defeated) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 2, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    prevHP.current = currentHP;
  }, [currentHP, defeated, shake]);

  useEffect(() => {
    if (defeated && !prevDefeated.current) {
      Animated.timing(defeatAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    }
    prevDefeated.current = defeated;
  }, [defeated, defeatAnim]);

  const hpPct = useMemo(() => {
    if (maxHP <= 0) return 0;
    return Math.max(0, Math.min(1, currentHP / maxHP));
  }, [currentHP, maxHP]);

  const isHit = currentHP < prevHP.current && !defeated;

  const shakeTranslate = shake.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, -10, 10, -6, 0],
  });

  const monsterStyle = {
    transform: [
      {
        scale: defeatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.92],
        }),
      },
      {
        rotate: defeatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-8deg'],
        }),
      },
    ],
    opacity: defeatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
    }),
  };

  return (
    <Pressable
      onPress={() => {
        if (defeated) return;
        const damage = Math.floor(Math.random() * 10) + 1;
        onAttack(damage);
      }}
      style={({ pressed }) => [styles.card, pressed && !defeated && styles.cardPressed]}
    >
      <View style={styles.cardInner}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.badge}>今日讨伐</Text>
            <Text style={styles.name}>{monster.name}</Text>
            <Text style={styles.title}>{monster.title}</Text>
          </View>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>{defeated ? '已击败' : '战斗中'}</Text>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <Animated.View
            style={[
              styles.monsterWrap,
              {
                transform: [{ translateX: shakeTranslate }],
                opacity: defeated ? 0.95 : 1,
              },
            ]}
          >
            <Animated.View style={monsterStyle}>
              <PixelMonster monsterIndex={monsterIndex} defeated={defeated} isHit={isHit} size={92} />
            </Animated.View>
            {defeated ? <View style={styles.defeatRing} /> : null}
          </Animated.View>

          <View style={styles.info}>
            <View style={styles.hpHeader}>
              <Text style={styles.hpLabel}>HP</Text>
              <Text style={styles.hpValue}>
                {Math.max(0, currentHP)} / {maxHP}
              </Text>
            </View>

            <View style={styles.hpTrack}>
              <Animated.View style={[styles.hpFillWrap, { width: `${hpPct * 100}%` }]}>
                <LinearGradient
                  colors={emberGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <View style={styles.rewardRow}>
              <Text style={styles.rewardText}>+{rewardXP} XP</Text>
              <Text style={styles.rewardDivider}>·</Text>
              <Text style={styles.rewardText}>+{rewardGem} 宝石</Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {defeated ? '怪兽已倒下，继续清理剩余弱点。' : '点击怪兽可造成 1-10 点额外伤害。'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {defeated ? (
        <View style={styles.defeatedOverlay} pointerEvents="none">
          <Text style={styles.defeatedText}>已击败</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: Colors.emberMuted,
  },
  cardInner: {
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  badge: {
    color: Colors.ember,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.emberLight,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  dayText: {
    color: Colors.ember,
    fontSize: 11,
    fontWeight: '800',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  monsterWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  hpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  hpLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  hpValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  hpTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.bgDeep,
    overflow: 'hidden',
  },
  hpFillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    color: Colors.ember,
    fontSize: 12,
    fontWeight: '800',
  },
  rewardDivider: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 2,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  defeatRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.emberMuted,
    opacity: 0.7,
  },
  defeatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 13, 10, 0.50)',
  },
  defeatedText: {
    color: Colors.emberButtonText,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
