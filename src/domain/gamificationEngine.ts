import { AttributeCategory, Difficulty, UserProfile, CheckInRecord, Habit } from '../types';
import { getClassAttributeMultiplier } from './classProgressionService';

export const BASE_XP: Record<Difficulty, number> = {
  facil: 15,
  medio: 30,
  dificil: 50,
};

export const EXPEDITION_POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 5,
  medio: 10,
  dificil: 20,
};

export const STREAK_BONUS_THRESHOLD = 3;
export const STREAK_BONUS_MULTIPLIER = 1.2;
export const MAX_HP = 100;
export const HP_RESTORE_PER_HABIT = 5;
export const SECOND_CHANCE_RESTORE_HP = 30;
export const HP_PENALTY_PER_MISSED = 10;
export const ATTRIBUTE_POINTS_PER_LEVEL = 150;

/**
 * Retorna o XP necessario para subir do nivel atual para o proximo
 */
export function getRequiredXPForLevel(level: number): number {
  return Math.max(100, level * 100);
}

/**
 * Calcula o XP a ser concedido ao concluir um habito, considerando streak bonus
 */
export function calculateXpGain(difficulty: Difficulty, currentStreak: number): number {
  const base = BASE_XP[difficulty] || BASE_XP.medio;
  if (currentStreak >= STREAK_BONUS_THRESHOLD) {
    return Math.round(base * STREAK_BONUS_MULTIPLIER);
  }
  return base;
}

/**
 * Calcula o nivel do atributo com base nos pontos acumulados
 */
export function calculateAttributeLevel(points: number): number {
  if (points <= 0) return 1;
  return Math.floor(points / ATTRIBUTE_POINTS_PER_LEVEL) + 1;
}

/**
 * Aplica ganho de XP e recalcula niveis (suporta subidas multiplas de nivel)
 */
export function applyXpGain(
  currentLevel: number,
  currentXP: number,
  xpGain: number
): { level: number; currentXP: number; leveledUp: boolean } {
  let level = currentLevel;
  let xp = currentXP + xpGain;
  let leveledUp = false;

  while (xp >= getRequiredXPForLevel(level)) {
    xp -= getRequiredXPForLevel(level);
    level += 1;
    leveledUp = true;
  }

  return { level, currentXP: xp, leveledUp };
}

/**
 * Reverte ganho de XP (ao desmarcar check-in no mesmo dia)
 */
export function revertXpGain(
  currentLevel: number,
  currentXP: number,
  xpToRemove: number
): { level: number; currentXP: number } {
  let level = currentLevel;
  let xp = currentXP - xpToRemove;

  while (xp < 0 && level > 1) {
    level -= 1;
    xp += getRequiredXPForLevel(level);
  }

  if (xp < 0) {
    xp = 0;
  }

  return { level, currentXP: xp };
}

/**
 * Processa a conclusao de uma meta na vida/perfil do usuario
 */
export function processHabitCompletion(
  profile: UserProfile,
  habit: Habit
): {
  updatedProfile: UserProfile;
  checkInRecord: Omit<CheckInRecord, 'id' | 'habitId' | 'date' | 'completedAt'>;
  newStreak: number;
  newBestStreak: number;
} {
  const newStreak = habit.currentStreak + 1;
  const newBestStreak = Math.max(habit.bestStreak, newStreak);
  const xpGained = calculateXpGain(habit.difficulty, habit.currentStreak);

  // Evolucao de nivel e XP
  const { level: newLevel, currentXP: newXP } = applyXpGain(
    profile.level,
    profile.currentXP,
    xpGained
  );

  // Evolucao do atributo com aplicacao de afinidade da classe ativa
  const currentAttr = profile.attributes[habit.category] || { points: 0, level: 1 };
  const attrMultiplier = getClassAttributeMultiplier(profile.currentClass || 'aprendiz', habit.category);
  const attributePointsGained = Math.round(xpGained * attrMultiplier);
  const updatedPoints = currentAttr.points + attributePointsGained;
  const updatedAttrLevel = calculateAttributeLevel(updatedPoints);

  // Concessao de pontos de expedicao
  const expeditionPointsGained = EXPEDITION_POINTS_BY_DIFFICULTY[habit.difficulty] || 10;
  const newExpeditionPoints = (profile.expeditionPoints || 0) + expeditionPointsGained;

  // Calculo de HP e Segunda Chance
  let newHp = profile.hp;
  let inSecondChance = profile.inSecondChance;
  let hpGained = 0;

  if (profile.inSecondChance) {
    newHp = Math.min(MAX_HP, profile.hp + SECOND_CHANCE_RESTORE_HP);
    hpGained = newHp - profile.hp;
    inSecondChance = false;
  } else {
    newHp = Math.min(MAX_HP, profile.hp + HP_RESTORE_PER_HABIT);
    hpGained = newHp - profile.hp;
  }

  const updatedProfile: UserProfile = {
    ...profile,
    level: newLevel,
    currentXP: newXP,
    hp: newHp,
    inSecondChance,
    currentClass: profile.currentClass || 'aprendiz',
    unlockedClasses: profile.unlockedClasses || ['aprendiz'],
    expeditionPoints: newExpeditionPoints,
    goldBalance: profile.goldBalance || 0,
    attributes: {
      ...profile.attributes,
      [habit.category]: {
        points: updatedPoints,
        level: updatedAttrLevel,
      },
    },
  };

  return {
    updatedProfile,
    checkInRecord: {
      xpGained,
      attributeGained: habit.category,
      attributePointsGained,
      hpGained,
      expeditionPointsGained,
    },
    newStreak,
    newBestStreak,
  };
}

/**
 * Reverte os ganhos de um check-in anterior no perfil e no habito
 */
export function revertHabitCompletion(
  profile: UserProfile,
  habit: Habit,
  record: CheckInRecord
): {
  updatedProfile: UserProfile;
  revertedStreak: number;
} {
  const { level, currentXP } = revertXpGain(profile.level, profile.currentXP, record.xpGained);

  const currentAttr = profile.attributes[record.attributeGained] || { points: 0, level: 1 };
  const revertedPoints = Math.max(0, currentAttr.points - record.attributePointsGained);
  const revertedAttrLevel = calculateAttributeLevel(revertedPoints);

  const revertedHp = Math.max(0, profile.hp - record.hpGained);
  const revertedExpedition = Math.max(
    0,
    (profile.expeditionPoints || 0) - (record.expeditionPointsGained || 0)
  );

  const updatedProfile: UserProfile = {
    ...profile,
    level,
    currentXP,
    hp: revertedHp,
    expeditionPoints: revertedExpedition,
    attributes: {
      ...profile.attributes,
      [record.attributeGained]: {
        points: revertedPoints,
        level: revertedAttrLevel,
      },
    },
  };

  const revertedStreak = Math.max(0, habit.currentStreak - 1);

  return {
    updatedProfile,
    revertedStreak,
  };
}

/**
 * Avalia penalidades na virada de dia quando habitos programados nao foram cumpridos
 */
export function evaluateMissedHabits(
  profile: UserProfile,
  missedCount: number
): { updatedProfile: UserProfile; hpLost: number; activatedSecondChance: boolean } {
  if (missedCount <= 0) {
    return { updatedProfile: profile, hpLost: 0, activatedSecondChance: false };
  }

  const hpLost = missedCount * HP_PENALTY_PER_MISSED;
  const newHp = Math.max(0, profile.hp - hpLost);
  const activatedSecondChance = newHp === 0 && !profile.inSecondChance;

  const updatedProfile: UserProfile = {
    ...profile,
    hp: newHp,
    inSecondChance: newHp === 0 ? true : profile.inSecondChance,
  };

  return { updatedProfile, hpLost, activatedSecondChance };
}

/**
 * Perfil inicial padrao
 */
export function createInitialProfile(): UserProfile {
  return {
    level: 1,
    currentXP: 0,
    hp: 100,
    inSecondChance: false,
    globalStreak: 0,
    bestGlobalStreak: 0,
    lastActiveDate: null,
    attributes: {
      intelecto: { points: 0, level: 1 },
      forca: { points: 0, level: 1 },
      disciplina: { points: 0, level: 1 },
    },
    currentClass: 'aprendiz',
    unlockedClasses: ['aprendiz'],
    expeditionPoints: 0,
    goldBalance: 0,
  };
}
