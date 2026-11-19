import { CharacterClassId } from './rpg';
export * from './rpg';

export type AttributeCategory = 'intelecto' | 'forca' | 'disciplina';

export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface Habit {
  id: string;
  title: string;
  category: AttributeCategory;
  difficulty: Difficulty;
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sabado
  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  reminderTime?: string | null; // Formato "HH:mm", ex: "07:30"
  reminderEnabled: boolean;
  earlyReminderEnabled?: boolean; // Aviso previo de 10 min antes
  notificationIds?: string[];
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  archived?: boolean;
}

export interface CheckInRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO 8601 string
  xpGained: number;
  attributeGained: AttributeCategory;
  attributePointsGained: number;
  hpGained: number;
  expeditionPointsGained?: number;
}

export interface AttributeProgress {
  points: number;
  level: number;
}

export interface UserProfile {
  level: number;
  currentXP: number;
  hp: number; // 0 a 100
  inSecondChance: boolean;
  globalStreak: number;
  bestGlobalStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  attributes: Record<AttributeCategory, AttributeProgress>;
  currentClass: CharacterClassId;
  unlockedClasses: CharacterClassId[];
  expeditionPoints: number;
  goldBalance: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'level' | 'attribute' | 'special';
  unlocked: boolean;
  unlockedAt?: string | null; // ISO 8601 string ou data formatada
  iconName: string;
  requirementText: string;
}

export type QuestDurationTier =
  | 'pontual'
  | 'semanal'
  | 'quinzenal'
  | 'mensal'
  | 'trimestral'
  | 'continua';

export type QuestRewardKind =
  | 'period_completion'
  | 'period_perfect'
  | 'continuous_milestone';

export type QuestLifecycleStatus =
  | 'ativa'
  | 'continua'
  | 'futura'
  | 'concluida'
  | 'encerrada';

export interface QuestRewardRecord {
  id: string;
  habitId: string;
  rewardKey: string; // 'period_completion' ou 'milestone:<dias>'
  kind: QuestRewardKind;
  tier: QuestDurationTier;
  milestoneDays?: number;
  xpGained: number;
  attributeGained: AttributeCategory;
  attributePointsGained: number;
  completionRate: number;
  awardedAt: string; // ISO 8601
  triggerDate: string; // YYYY-MM-DD
}
