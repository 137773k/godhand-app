import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  monsterIndex: number;
  defeated: boolean;
  isHit: boolean;
  size?: number;
};

type Palette = {
  outline: string;
  body: string;
  accent: string;
  highlight: string;
  eye: string;
  mouth: string;
  shadow: string;
};

type PixelRole = keyof Palette;

type PixelCell = {
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
};

type MonsterSpec = {
  palette: Palette;
  body: (x: number, y: number) => boolean;
  accent: (x: number, y: number) => boolean;
  highlight: (x: number, y: number) => boolean;
  eye: (x: number, y: number) => boolean;
  mouth: (x: number, y: number) => boolean;
  shadow: (x: number, y: number) => boolean;
};

const GRID = 16;

const PALETTES: Palette[] = [
  {
    outline: '#8C5566',
    body: '#FFB5C2',
    accent: '#FF8FA3',
    highlight: '#FFE1E8',
    eye: '#3E1020',
    mouth: '#C85B74',
    shadow: '#E98E9F',
  },
  {
    outline: '#163726',
    body: '#2D6A4F',
    accent: '#40916C',
    highlight: '#A9E7BE',
    eye: '#F3FFF2',
    mouth: '#0D2016',
    shadow: '#24543F',
  },
  {
    outline: '#B15A7E',
    body: '#FF70A6',
    accent: '#FFD166',
    highlight: '#FFF0B8',
    eye: '#4A1630',
    mouth: '#C94D83',
    shadow: '#E66196',
  },
  {
    outline: '#4E5160',
    body: '#6C757D',
    accent: '#9D4EDD',
    highlight: '#C8A6FF',
    eye: '#F8F2FF',
    mouth: '#271B36',
    shadow: '#545B6A',
  },
  {
    outline: '#5A1D17',
    body: '#9B2226',
    accent: '#CA6702',
    highlight: '#F4A261',
    eye: '#FFF2DA',
    mouth: '#38100E',
    shadow: '#74211F',
  },
  {
    outline: '#331042',
    body: '#5A189A',
    accent: '#7B2CBF',
    highlight: '#D3A6FF',
    eye: '#F6EFFF',
    mouth: '#291033',
    shadow: '#48157A',
  },
  {
    outline: '#604023',
    body: '#7F4F24',
    accent: '#B08968',
    highlight: '#D9B68F',
    eye: '#FFF6E9',
    mouth: '#372012',
    shadow: '#6F4627',
  },
];

function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

function inRect(x: number, y: number, left: number, top: number, right: number, bottom: number) {
  return x >= left && x <= right && y >= top && y <= bottom;
}

function inDiamond(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  return Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1;
}

function triangleUp(x: number, y: number, apexX: number, apexY: number, halfWidth: number, height: number) {
  if (y < apexY || y > apexY + height) return false;
  const progress = (y - apexY) / height;
  return Math.abs(x - apexX) <= halfWidth * progress;
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)),
  );
  const sx = x1 + t * dx;
  const sy = y1 + t * dy;
  return Math.hypot(px - sx, py - sy);
}

function nearLine(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness = 0.55,
) {
  return distanceToSegment(x, y, x1, y1, x2, y2) <= thickness;
}

function hashValue(seed: number) {
  const raw = Math.sin(seed) * 10000;
  return raw - Math.floor(raw);
}

function isBorderPixel(x: number, y: number, body: MonsterSpec['body']) {
  if (!body(x, y)) return false;
  const neighbors = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];
  return neighbors.some(([nx, ny]) => !body(nx, ny));
}

function buildMonsterSpec(monsterIndex: number): MonsterSpec {
  const palette = PALETTES[monsterIndex % PALETTES.length];

  switch (monsterIndex % 7) {
    case 0:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 7.5, 8.1, 4.3, 4.1) ||
          inEllipse(x, y, 6.0, 9.5, 1.5, 1.2) ||
          inEllipse(x, y, 9.0, 9.5, 1.5, 1.2) ||
          inEllipse(x, y, 5.8, 6.0, 1.1, 1.0) ||
          inEllipse(x, y, 9.2, 6.0, 1.1, 1.0),
        accent: (x, y) =>
          triangleUp(x, y, 5.3, 4.0, 1.2, 3.0) ||
          triangleUp(x, y, 9.7, 4.0, 1.2, 3.0) ||
          inRect(x, y, 6, 11, 9, 12),
        highlight: (x, y) => inEllipse(x, y, 7.5, 8.8, 1.5, 1.0),
        eye: (x, y) => (x === 6 && y === 7) || (x === 9 && y === 7),
        mouth: (x, y) => (x === 7 && y === 9) || (x === 8 && y === 9),
        shadow: (x, y) => y >= 9 && inEllipse(x, y, 7.5, 8.1, 4.3, 4.1),
      };
    case 1:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 8.0, 8.0, 4.6, 3.0) ||
          inEllipse(x, y, 12.0, 7.5, 1.7, 1.4) ||
          inRect(x, y, 3, 8, 6, 10) ||
          nearLine(x, y, 4, 9, 1, 11, 0.75),
        accent: (x, y) =>
          triangleUp(x, y, 5.0, 4.6, 1.2, 2.6) ||
          triangleUp(x, y, 7.0, 4.4, 1.1, 2.8) ||
          triangleUp(x, y, 9.0, 4.8, 1.1, 2.4) ||
          triangleUp(x, y, 11.6, 5.0, 0.9, 2.2),
        highlight: (x, y) => inEllipse(x, y, 8.4, 8.8, 2.0, 1.0),
        eye: (x, y) => x === 12 && y === 7,
        mouth: (x, y) => (x === 12 && y === 8) || (x === 13 && y === 8),
        shadow: (x, y) => y >= 9 && (inEllipse(x, y, 8.0, 8.0, 4.6, 3.0) || inRect(x, y, 3, 8, 6, 10)),
      };
    case 2:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 7.5, 8.4, 4.5, 3.9) ||
          inEllipse(x, y, 5.6, 6.4, 1.8, 1.6) ||
          inEllipse(x, y, 9.4, 6.5, 1.8, 1.6) ||
          inEllipse(x, y, 6.5, 10.8, 1.5, 1.3) ||
          inEllipse(x, y, 8.5, 10.8, 1.5, 1.3),
        accent: (x, y) =>
          nearLine(x, y, 4, 7, 11, 9, 0.45) ||
          nearLine(x, y, 5, 11, 10, 5, 0.45) ||
          inRect(x, y, 6, 8, 9, 8),
        highlight: (x, y) =>
          (x === 6 && y === 7) ||
          (x === 9 && y === 7) ||
          (x === 6 && y === 10) ||
          (x === 9 && y === 10),
        eye: (x, y) => (x === 6 && y === 8) || (x === 9 && y === 8),
        mouth: (x, y) => (x === 7 && y === 10) || (x === 8 && y === 10),
        shadow: (x, y) => y >= 9 && inEllipse(x, y, 7.5, 8.4, 4.5, 3.9),
      };
    case 3:
      return {
        palette,
        body: (x, y) =>
          inRect(x, y, 5, 4, 10, 11) ||
          inRect(x, y, 6, 3, 9, 4) ||
          inRect(x, y, 3, 7, 5, 8) ||
          inRect(x, y, 10, 7, 12, 8) ||
          inRect(x, y, 6, 12, 7, 14) ||
          inRect(x, y, 8, 12, 9, 14),
        accent: (x, y) =>
          inRect(x, y, 5, 6, 10, 6) ||
          inRect(x, y, 5, 9, 10, 9) ||
          inRect(x, y, 4, 8, 5, 9) ||
          inRect(x, y, 10, 8, 11, 9),
        highlight: (x, y) => (x === 5 && y === 5) || (x === 10 && y === 5),
        eye: (x, y) => (x === 6 && y === 6) || (x === 8 && y === 6),
        mouth: (x, y) => inRect(x, y, 6, 8, 8, 8) || (x === 7 && y === 9),
        shadow: (x, y) => y >= 8 && inRect(x, y, 5, 4, 10, 11),
      };
    case 4:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 6.5, 8.2, 4.2, 3.4) ||
          inRect(x, y, 9, 7, 13, 9) ||
          inEllipse(x, y, 13.2, 7.8, 1.4, 1.2) ||
          nearLine(x, y, 4, 9, 1, 12, 0.75),
        accent: (x, y) =>
          triangleUp(x, y, 4.5, 4.4, 1.0, 2.2) ||
          triangleUp(x, y, 6.0, 3.8, 1.0, 2.6) ||
          triangleUp(x, y, 7.6, 4.3, 1.0, 2.3) ||
          triangleUp(x, y, 9.2, 4.8, 1.0, 2.0) ||
          triangleUp(x, y, 11.0, 5.0, 0.9, 1.8) ||
          inRect(x, y, 12, 8, 13, 8),
        highlight: (x, y) => (x === 12 && y === 7) || (x === 13 && y === 7) || (x === 11 && y === 8),
        eye: (x, y) => x === 12 && y === 7,
        mouth: (x, y) => (x === 12 && y === 8) || (x === 13 && y === 8),
        shadow: (x, y) => y >= 9 && (inEllipse(x, y, 6.5, 8.2, 4.2, 3.4) || inRect(x, y, 9, 7, 13, 9)),
      };
    case 5:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 7.4, 9.1, 3.0, 3.8) ||
          inRect(x, y, 6, 5, 9, 8) ||
          nearLine(x, y, 5, 11, 3, 13, 0.7),
        accent: (x, y) =>
          triangleUp(x, y, 4.7, 4.1, 1.3, 3.1) ||
          triangleUp(x, y, 10.3, 4.1, 1.3, 3.1) ||
          nearLine(x, y, 5, 11, 3, 13, 0.45) ||
          nearLine(x, y, 10, 11, 12, 13, 0.45),
        highlight: (x, y) => (x === 6 && y === 7) || (x === 9 && y === 7) || inEllipse(x, y, 7.4, 8.4, 1.5, 1.1),
        eye: (x, y) => (x === 6 && y === 7) || (x === 9 && y === 7),
        mouth: (x, y) => (x === 7 && y === 9) || (x === 8 && y === 9),
        shadow: (x, y) => y >= 9 && (inEllipse(x, y, 7.4, 9.1, 3.0, 3.8) || inRect(x, y, 6, 5, 9, 8)),
      };
    default:
      return {
        palette,
        body: (x, y) =>
          inEllipse(x, y, 7.0, 8.7, 4.6, 3.5) ||
          inRect(x, y, 10, 7, 13, 10) ||
          inRect(x, y, 3, 8, 5, 10),
        accent: (x, y) =>
          triangleUp(x, y, 4.8, 5.1, 1.2, 2.1) ||
          triangleUp(x, y, 6.4, 4.8, 1.0, 2.6) ||
          triangleUp(x, y, 8.0, 5.1, 1.0, 2.1) ||
          triangleUp(x, y, 9.6, 5.3, 1.0, 1.8) ||
          nearLine(x, y, 11, 8, 13, 7, 0.4) ||
          nearLine(x, y, 11, 9, 13, 10, 0.4),
        highlight: (x, y) => (x === 11 && y === 8) || (x === 12 && y === 8),
        eye: (x, y) => (x === 6 && y === 8) || (x === 7 && y === 8),
        mouth: (x, y) => (x === 11 && y === 9) || (x === 12 && y === 9),
        shadow: (x, y) => y >= 9 && (inEllipse(x, y, 7.0, 8.7, 4.6, 3.5) || inRect(x, y, 10, 7, 13, 10)),
      };
  }
}

function PixelMonster({ monsterIndex, defeated, isHit, size = 84 }: Props) {
  const breathing = useRef(new Animated.Value(0)).current;
  const defeatProgress = useRef(new Animated.Value(defeated ? 1 : 0)).current;
  const flashPulse = useRef(new Animated.Value(0)).current;
  const prevHit = useRef(false);
  const prevDefeated = useRef(defeated);
  const prevMonsterIndex = useRef(monsterIndex);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathing, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathing, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [breathing]);

  useEffect(() => {
    if (prevMonsterIndex.current !== monsterIndex) {
      flashPulse.stopAnimation();
      flashPulse.setValue(0);
      defeatProgress.stopAnimation();
      defeatProgress.setValue(defeated ? 1 : 0);
      prevHit.current = false;
    }
    prevMonsterIndex.current = monsterIndex;
  }, [defeated, defeatProgress, flashPulse, monsterIndex]);

  useEffect(() => {
    if (isHit && !prevHit.current && !defeated) {
      flashPulse.stopAnimation();
      flashPulse.setValue(0);
      Animated.sequence([
        Animated.timing(flashPulse, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashPulse, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevHit.current = isHit;
  }, [defeated, flashPulse, isHit]);

  useEffect(() => {
    if (defeated && !prevDefeated.current) {
      defeatProgress.stopAnimation();
      defeatProgress.setValue(0);
      Animated.timing(defeatProgress, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else if (!defeated && prevDefeated.current) {
      defeatProgress.stopAnimation();
      defeatProgress.setValue(0);
    }
    prevDefeated.current = defeated;
  }, [defeatProgress, defeated]);

  const spec = useMemo(() => buildMonsterSpec(monsterIndex), [monsterIndex]);
  const pixelSize = Math.max(4, Math.min(6, Math.floor(size / GRID) || 4));
  const artSize = pixelSize * GRID;

  const breathingScale = breathing.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  const defeatScale = defeatProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.35],
  });
  const flashOpacity = flashPulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.72, 0],
  });
  const defeatOpacity = defeatProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.72, 0],
  });

  const pixels = useMemo<PixelCell[]>(() => {
    const center = (GRID - 1) / 2;
    const cells: PixelCell[] = [];

    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        let role: PixelRole | null = null;

        if (spec.eye(x, y)) role = 'eye';
        else if (spec.mouth(x, y)) role = 'mouth';
        else if (spec.highlight(x, y)) role = 'highlight';
        else if (spec.accent(x, y)) role = 'accent';
        else if (spec.shadow(x, y)) role = 'shadow';
        else if (isBorderPixel(x, y, spec.body)) role = 'outline';
        else if (spec.body(x, y)) role = 'body';

        if (!role) continue;

        const seed = (monsterIndex + 1) * 97 + x * 19 + y * 23;
        const driftA = hashValue(seed);
        const driftB = hashValue(seed + 13);
        const angle = Math.atan2(y - center, x - center) + (driftA - 0.5) * 1.35;
        const distance = Math.hypot(x - center, y - center);
        const spread = 2 + driftB * 4.8 + distance * 0.45;

        cells.push({
          x,
          y,
          color: spec.palette[role],
          dx: Math.cos(angle) * spread,
          dy: Math.sin(angle) * spread,
        });
      }
    }

    return cells;
  }, [monsterIndex, spec]);

  return (
    <View pointerEvents="none" style={[styles.wrapper, { width: size, height: size }]}>
      <Animated.View style={[styles.outer, { width: size, height: size, transform: [{ scale: breathingScale }] }]}>
        <Animated.View style={[styles.stage, { width: artSize, height: artSize, transform: [{ scale: defeatScale }] }]}>
          {pixels.map(pixel => (
            <Animated.View
              key={`${pixel.x}-${pixel.y}`}
              style={[
                styles.pixel,
                {
                  left: pixel.x * pixelSize,
                  top: pixel.y * pixelSize,
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixel.color,
                  opacity: defeatOpacity,
                  transform: [
                    {
                      translateX: defeatProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, pixel.dx],
                      }),
                    },
                    {
                      translateY: defeatProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, pixel.dy],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: 'rgba(255, 72, 72, 0.45)',
                opacity: flashOpacity,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    position: 'relative',
    overflow: 'visible',
  },
  pixel: {
    position: 'absolute',
    borderRadius: 0,
  },
});

export default memo(PixelMonster);
