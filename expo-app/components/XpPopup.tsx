import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../theme';

type Props = {
  visible: boolean;
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
};

export default function XpPopup({ visible, amount, x, y, onComplete }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    translateY.setValue(0);
    scale.setValue(0.85);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 820, useNativeDriver: true }),
      ]),
      Animated.timing(translateY, { toValue: -48, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.92, duration: 780, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, [amount, onComplete, opacity, scale, translateY, visible]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.layer]}>
      <Animated.View
        style={[
          styles.popup,
          {
            left: x,
            top: y,
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <Text style={styles.text}>+{amount} XP</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 40,
  },
  popup: {
    position: 'absolute',
    marginLeft: -18,
    marginTop: -18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    shadowColor: Colors.ember,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    color: Colors.emberButtonText,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
