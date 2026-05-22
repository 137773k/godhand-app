import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Monster = {
  emoji: string;
  name: string;
  title: string;
  hp: number;
  rewardXP: number;
  rewardGem: number;
};

export type GameState = {
  date: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalDays: number;
  gems: number;
  monsterIdx: number;
  monsterHP: number;
  monsterMaxHP: number;
  monsterDefeated: boolean;
  completedTasks: string[];
};

const STORAGE_KEY = 'godhand_game_state';

export const MONSTERS: Monster[] = [
  { emoji: '🐷', name: '肥胖巨魔', title: '懒惰与卡路里的化身', hp: 1000, rewardXP: 300, rewardGem: 50 },
  { emoji: '🐉', name: '脂肪龙', title: '困在腰腹里的恶龙', hp: 1200, rewardXP: 350, rewardGem: 60 },
  { emoji: '🍬', name: '糖分怪', title: '甜食诱惑的具象化', hp: 800, rewardXP: 250, rewardGem: 40 },
  { emoji: '🧟', name: '熬夜僵尸', title: '吞噬你精神的夜行者', hp: 900, rewardXP: 280, rewardGem: 45 },
  { emoji: '🦖', name: '暴食暴龙', title: '一口吞掉自律的怪物', hp: 1500, rewardXP: 400, rewardGem: 80 },
  { emoji: '😈', name: '偷懒恶魔', title: '在耳边低语“明天再说”', hp: 700, rewardXP: 220, rewardGem: 35 },
  { emoji: '🐗', name: '赘肉野猪', title: '横冲直撞的体脂破坏者', hp: 1100, rewardXP: 320, rewardGem: 55 },
];

const clampMonsterIndex = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MONSTERS.length - 1, Math.floor(value)));
};

export const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function applyLevelUps(state: GameState) {
  let next = { ...state };
  let leveled = false;

  while (next.xp >= next.xpToNext) {
    next.xp -= next.xpToNext;
    next.level += 1;
    next.xpToNext = Math.floor(next.xpToNext * 1.2);
    leveled = true;
  }

  return { state: next, leveled };
}

function buildDefaultState(): GameState {
  const monsterIdx = Math.floor(Math.random() * MONSTERS.length);
  const monster = MONSTERS[monsterIdx];

  return {
    date: getTodayKey(),
    level: 12,
    xp: 620,
    xpToNext: 1000,
    streak: 7,
    totalDays: 47,
    gems: 280,
    monsterIdx,
    monsterHP: monster.hp,
    monsterMaxHP: monster.hp,
    monsterDefeated: false,
    completedTasks: [],
  };
}

function normalizeState(raw: Partial<GameState> | null): GameState {
  const fallback = buildDefaultState();

  if (!raw) return fallback;
  if (raw.date && raw.date !== getTodayKey()) return fallback;

  const monsterIdx = clampMonsterIndex(typeof raw.monsterIdx === 'number' ? raw.monsterIdx : fallback.monsterIdx);
  const monster = MONSTERS[monsterIdx];
  const completedTasks = Array.isArray(raw.completedTasks)
    ? Array.from(new Set(raw.completedTasks.filter((task): task is string => typeof task === 'string' && task.length > 0)))
    : [];

  return {
    ...fallback,
    ...raw,
    date: getTodayKey(),
    level: typeof raw.level === 'number' ? raw.level : fallback.level,
    xp: typeof raw.xp === 'number' ? raw.xp : fallback.xp,
    xpToNext: typeof raw.xpToNext === 'number' ? raw.xpToNext : fallback.xpToNext,
    streak: typeof raw.streak === 'number' ? raw.streak : fallback.streak,
    totalDays: typeof raw.totalDays === 'number' ? raw.totalDays : fallback.totalDays,
    gems: typeof raw.gems === 'number' ? raw.gems : fallback.gems,
    monsterIdx,
    monsterMaxHP: typeof raw.monsterMaxHP === 'number' && raw.monsterMaxHP > 0 ? raw.monsterMaxHP : monster.hp,
    monsterHP: typeof raw.monsterHP === 'number' && raw.monsterHP >= 0 ? Math.min(raw.monsterHP, monster.hp) : monster.hp,
    monsterDefeated: Boolean(raw.monsterDefeated),
    completedTasks,
  };
}

export async function loadState(): Promise<GameState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return buildDefaultState();

  try {
    return normalizeState(JSON.parse(raw) as Partial<GameState>);
  } catch {
    return buildDefaultState();
  }
}

export async function saveState(state: GameState): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      date: getTodayKey(),
    }),
  );
}

export function getDefaultState() {
  return buildDefaultState();
}

export default function useGameState() {
  const [state, setState] = useState<GameState>(() => buildDefaultState());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const loaded = await loadState();
      if (!mounted) return;
      setState(loaded);
      setIsReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void saveState(state);
  }, [isReady, state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(current => {
        if (current.date === getTodayKey()) {
          return current;
        }
        return buildDefaultState();
      });
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  const checkLevelUp = useCallback(() => {
    setState(current => applyLevelUps(current).state);
  }, []);

  const damageMonster = useCallback((amount: number) => {
    const damage = Math.max(0, Math.floor(amount));
    if (damage <= 0) return;

    setState(current => {
      if (current.date !== getTodayKey()) {
        return current;
      }
      if (current.monsterDefeated) {
        return current;
      }

      const monster = MONSTERS[current.monsterIdx];
      const remainingHP = Math.max(0, current.monsterHP - damage);

      if (remainingHP > 0) {
        return {
          ...current,
          monsterHP: remainingHP,
        };
      }

      const rewarded = applyLevelUps({
        ...current,
        monsterHP: 0,
        monsterDefeated: true,
        xp: current.xp + monster.rewardXP,
        gems: current.gems + monster.rewardGem,
        streak: current.streak + 1,
        totalDays: current.totalDays + 1,
      });

      return rewarded.state;
    });
  }, []);

  const completeTask = useCallback((taskId: string, xpAmount: number) => {
    const xp = Math.max(0, Math.floor(xpAmount));
    if (!taskId || xp <= 0) return;

    setState(current => {
      if (current.date !== getTodayKey()) {
        return current;
      }
      if (current.completedTasks.includes(taskId)) {
        return current;
      }

      const monster = MONSTERS[current.monsterIdx];
      const nextDamage = Math.max(1, Math.floor(xp * 1.5));
      const taskAdded = {
        ...current,
        completedTasks: [...current.completedTasks, taskId],
        xp: current.xp + xp,
      };

      const leveled = applyLevelUps(taskAdded);
      const postDamageHP = Math.max(0, current.monsterHP - nextDamage);

      if (postDamageHP > 0 || current.monsterDefeated) {
        return {
          ...leveled.state,
          monsterHP: current.monsterDefeated ? 0 : postDamageHP,
        };
      }

      const rewarded = applyLevelUps({
        ...leveled.state,
        monsterHP: 0,
        monsterDefeated: true,
        xp: leveled.state.xp + monster.rewardXP,
        gems: leveled.state.gems + monster.rewardGem,
        streak: leveled.state.streak + 1,
        totalDays: leveled.state.totalDays + 1,
      });

      return rewarded.state;
    });
  }, []);

  const monster = useMemo(() => MONSTERS[state.monsterIdx], [state.monsterIdx]);
  const xpProgress = state.xpToNext > 0 ? state.xp / state.xpToNext : 0;
  const monsterProgress = state.monsterMaxHP > 0 ? state.monsterHP / state.monsterMaxHP : 0;

  return {
    state,
    monster,
    isReady,
    xpProgress,
    monsterProgress,
    checkLevelUp,
    completeTask,
    damageMonster,
  };
}
