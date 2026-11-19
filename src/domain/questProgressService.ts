import {
  CheckInRecord,
  Difficulty,
  Habit,
  QuestDurationTier,
  QuestLifecycleStatus,
  QuestRewardKind,
  QuestRewardRecord,
  AttributeCategory,
} from '../types';

export const DIFFICULTY_DURATION_MULTIPLIER: Record<Difficulty, number> = {
  facil: 1.0,
  medio: 1.5,
  dificil: 2.0,
};

export const QUEST_MIN_COMPLETION_RATE = 0.8;
export const SHORT_QUEST_MAX_SCHEDULED_DAYS = 3;
export const PERFECT_QUEST_BONUS_MULTIPLIER = 1.2;

export interface DurationTierConfig {
  tier: Exclude<QuestDurationTier, 'continua'>;
  minDays: number;
  maxDays: number;
  label: string;
  shortLabel: string;
  baseXp: number;
}

export const DURATION_TIER_CONFIGS: DurationTierConfig[] = [
  {
    tier: 'pontual',
    minDays: 1,
    maxDays: 6,
    label: 'Curta (1-6 dias)',
    shortLabel: 'Curta',
    baseXp: 50,
  },
  {
    tier: 'semanal',
    minDays: 7,
    maxDays: 13,
    label: '1 Semana (7-13 dias)',
    shortLabel: '1 Semana',
    baseXp: 150,
  },
  {
    tier: 'quinzenal',
    minDays: 14,
    maxDays: 27,
    label: '2 Semanas (14-27 dias)',
    shortLabel: '2 Semanas',
    baseXp: 350,
  },
  {
    tier: 'mensal',
    minDays: 28,
    maxDays: 89,
    label: '1 Mês (28-89 dias)',
    shortLabel: '1 Mês',
    baseXp: 800,
  },
  {
    tier: 'trimestral',
    minDays: 90,
    maxDays: Number.POSITIVE_INFINITY,
    label: 'Longa Duração (90+ dias)',
    shortLabel: '3+ Meses',
    baseXp: 2200,
  },
];

export interface ContinuousMilestoneConfig {
  days: number;
  label: string;
  tier: QuestDurationTier;
  baseXp: number;
}

export const CONTINUOUS_MILESTONES: ContinuousMilestoneConfig[] = [
  { days: 7, label: '1 Semana', tier: 'semanal', baseXp: 150 },
  { days: 30, label: '1 Mês', tier: 'mensal', baseXp: 800 },
  { days: 90, label: '3 Meses', tier: 'trimestral', baseXp: 2200 },
  { days: 180, label: '6 Meses', tier: 'trimestral', baseXp: 4000 },
  { days: 365, label: '1 Ano', tier: 'trimestral', baseXp: 8000 },
];

export interface QuestTimelineDay {
  date: string;
  state: 'completed' | 'missed' | 'pending_today' | 'upcoming';
}

export interface ContinuousMilestoneProgress {
  days: number;
  label: string;
  tier: QuestDurationTier;
  xpReward: number;
  achieved: boolean;
  remainingCheckIns: number;
}

export interface QuestProgressSummary {
  habit: Habit;
  status: QuestLifecycleStatus;
  isBounded: boolean;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  calendarDays: number;
  tier: QuestDurationTier;
  tierLabel: string;
  tierShortLabel: string;
  scheduledCount: number;
  completedCount: number;
  missedCount: number;
  remainingCount: number;
  daysRemaining: number | null;
  completionRate: number;
  minRequiredRate: number;
  canStillReachMinTarget: boolean;
  projectedFixedXp: number;
  perfectFixedXp: number;
  supportsPerfectBonus: boolean;
  xpEarnedFromCheckIns: number;
  xpEarnedFromBonuses: number;
  totalXpEarned: number;
  claimedRewards: QuestRewardRecord[];
  periodReward: QuestRewardRecord | null;
  milestones: ContinuousMilestoneProgress[];
  nextMilestone: ContinuousMilestoneProgress | null;
  timeline: QuestTimelineDay[];
}

export interface PendingQuestReward {
  habitId: string;
  rewardKey: string;
  kind: QuestRewardKind;
  tier: QuestDurationTier;
  milestoneDays?: number;
  xpGained: number;
  attributeGained: AttributeCategory;
  completionRate: number;
  triggerDate: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;
const CONTINUOUS_TIMELINE_LIMIT = 30;
const CONTINUOUS_LOOKBACK_DAYS = 210;

/**
 * Valida se uma string representa uma data real no formato YYYY-MM-DD
 */
export function isValidDateString(dateStr?: string | null): dateStr is string {
  if (!dateStr || !DATE_PATTERN.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Converte YYYY-MM-DD para Date no fuso horario local sem deslocamento UTC
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata um objeto Date local para YYYY-MM-DD
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a quantidade de dias corridos inclusivos entre duas datas YYYY-MM-DD
 */
export function getInclusiveCalendarDays(startDate: string, endDate: string): number {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return 0;
  }
  if (endDate < startDate) {
    return 0;
  }

  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  return Math.round((utc2 - utc1) / MS_PER_DAY) + 1;
}

/**
 * Determina a data inicial efetiva do habito para calculos de vigencia
 */
export function getEffectiveStartDate(
  habit: Pick<Habit, 'startDate' | 'createdAt'>,
  fallbackDate?: string
): string {
  if (isValidDateString(habit.startDate)) {
    return habit.startDate;
  }
  const createdPrefix = habit.createdAt ? habit.createdAt.slice(0, 10) : '';
  if (isValidDateString(createdPrefix)) {
    return createdPrefix;
  }
  if (isValidDateString(fallbackDate)) {
    return fallbackDate;
  }
  return formatLocalDate(new Date());
}

/**
 * Retorna a configuracao da faixa de duracao com base nos dias corridos inclusivos
 */
export function getDurationTier(daysCount: number): DurationTierConfig {
  const normalizedDays = Math.max(1, daysCount);
  const found = DURATION_TIER_CONFIGS.find(
    (cfg) => normalizedDays >= cfg.minDays && normalizedDays <= cfg.maxDays
  );
  return found || DURATION_TIER_CONFIGS[DURATION_TIER_CONFIGS.length - 1];
}

export interface DeriveDifficultyParams {
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek: number[];
}

/**
 * Deriva a dificuldade ('facil' | 'medio' | 'dificil') automaticamente a partir
 * do periodo de vigencia e da quantidade de dias programados para cumprimento.
 * Metas curtas/menores recebem menor dificuldade e menos XP;
 * metas maiores/mais longas recebem maior dificuldade e mais XP.
 */
export function deriveHabitDifficulty(params: DeriveDifficultyParams): Difficulty {
  const { startDate, endDate, daysOfWeek } = params;
  const safeDaysOfWeek = Array.isArray(daysOfWeek) ? daysOfWeek : [];

  const hasBoundedRange =
    isValidDateString(startDate) &&
    isValidDateString(endDate) &&
    startDate <= endDate;

  if (hasBoundedRange) {
    const calendarDays = getInclusiveCalendarDays(startDate, endDate);
    const scheduledDates = getScheduledDatesInRange({ daysOfWeek: safeDaysOfWeek }, startDate, endDate);
    const scheduledCount = scheduledDates.length;

    // Metas pontuais/curtas (1 a 6 dias corridos OU ate 4 dias de meta programada)
    if (calendarDays <= 6 || scheduledCount <= 4) {
      return 'facil';
    }

    // Metas medias (7 a 27 dias corridos OU ate 19 dias programados)
    if (calendarDays <= 27 || scheduledCount <= 19) {
      return 'medio';
    }

    // Metas mensais, trimestrais e de longo prazo (28+ dias e 20+ programados)
    return 'dificil';
  }

  // Modo continuo (sem data final delimitada):
  // 1 ou 2 dias por semana -> 'medio'; 3 ou mais dias por semana -> 'dificil'
  if (safeDaysOfWeek.length <= 2) {
    return 'medio';
  }
  return 'dificil';
}

/**
 * Calcula os valores de bonus fixo e Quest Perfeita para uma duracao e dificuldade
 */
export function calculateDurationFixedXp(
  daysCount: number,
  difficulty: Difficulty,
  scheduledCount?: number
): {
  tier: Exclude<QuestDurationTier, 'continua'>;
  label: string;
  shortLabel: string;
  baseXp: number;
  fixedXp: number;
  perfectXp: number;
  supportsPerfectBonus: boolean;
} {
  const config = getDurationTier(daysCount);
  const multiplier = DIFFICULTY_DURATION_MULTIPLIER[difficulty] || 1.0;
  const fixedXp = Math.round(config.baseXp * multiplier);
  const supportsPerfectBonus =
    scheduledCount !== undefined
      ? scheduledCount > SHORT_QUEST_MAX_SCHEDULED_DAYS
      : daysCount > SHORT_QUEST_MAX_SCHEDULED_DAYS;
  const perfectXp = supportsPerfectBonus
    ? Math.round(fixedXp * PERFECT_QUEST_BONUS_MULTIPLIER)
    : fixedXp;

  return {
    tier: config.tier,
    label: config.label,
    shortLabel: config.shortLabel,
    baseXp: config.baseXp,
    fixedXp,
    perfectXp,
    supportsPerfectBonus,
  };
}

/**
 * Calcula o XP de um marco continuo ajustado pela dificuldade
 */
export function calculateMilestoneXp(milestoneDays: number, difficulty: Difficulty): number {
  const milestone = CONTINUOUS_MILESTONES.find((m) => m.days === milestoneDays);
  if (!milestone) {
    return 0;
  }
  const multiplier = DIFFICULTY_DURATION_MULTIPLIER[difficulty] || 1.0;
  return Math.round(milestone.baseXp * multiplier);
}

/**
 * Lista todas as datas programadas (YYYY-MM-DD) dentro de [startDate, endDate]
 */
export function getScheduledDatesInRange(
  habit: Pick<Habit, 'daysOfWeek'>,
  startDate: string,
  endDate: string
): string[] {
  if (!isValidDateString(startDate) || !isValidDateString(endDate) || endDate < startDate) {
    return [];
  }

  const dates: string[] = [];
  const cursor = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const allowAllDays = !habit.daysOfWeek || habit.daysOfWeek.length === 0;

  while (cursor.getTime() <= end.getTime()) {
    const dayOfWeek = cursor.getDay();
    if (allowAllDays || habit.daysOfWeek.includes(dayOfWeek)) {
      dates.push(formatLocalDate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

/**
 * Gera os ultimos dias programados de uma quest continua ate a data de referencia
 */
function getRecentContinuousTimeline(
  habit: Pick<Habit, 'daysOfWeek'>,
  effectiveStartDate: string,
  referenceDate: string,
  completedDateSet: Set<string>
): QuestTimelineDay[] {
  if (
    !isValidDateString(effectiveStartDate) ||
    !isValidDateString(referenceDate) ||
    effectiveStartDate > referenceDate
  ) {
    return [];
  }

  const startMs = parseLocalDate(effectiveStartDate).getTime();
  const cursor = parseLocalDate(referenceDate);
  const allowAllDays = !habit.daysOfWeek || habit.daysOfWeek.length === 0;
  const collected: QuestTimelineDay[] = [];

  for (
    let i = 0;
    i < CONTINUOUS_LOOKBACK_DAYS &&
    cursor.getTime() >= startMs &&
    collected.length < CONTINUOUS_TIMELINE_LIMIT;
    i += 1
  ) {
    const dayOfWeek = cursor.getDay();
    if (allowAllDays || habit.daysOfWeek.includes(dayOfWeek)) {
      const dateStr = formatLocalDate(cursor);
      let state: QuestTimelineDay['state'];
      if (completedDateSet.has(dateStr)) {
        state = 'completed';
      } else if (dateStr === referenceDate) {
        state = 'pending_today';
      } else {
        state = 'missed';
      }
      collected.push({ date: dateStr, state });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return collected.reverse();
}

/**
 * Calcula o resumo completo de evolucao, aderencia e recompensas de uma quest
 */
export function computeQuestProgress(
  habit: Habit,
  checkIns: CheckInRecord[],
  questRewards: QuestRewardRecord[],
  referenceDate: string
): QuestProgressSummary {
  const effectiveStartDate = getEffectiveStartDate(habit, referenceDate);
  const isBounded = isValidDateString(habit.endDate);
  const effectiveEndDate = isBounded ? (habit.endDate as string) : null;

  const habitCheckIns = checkIns.filter((c) => c.habitId === habit.id);
  const completedDateSet = new Set(habitCheckIns.map((c) => c.date));
  const claimedRewards = questRewards.filter((r) => r.habitId === habit.id);

  const xpEarnedFromCheckIns = habitCheckIns.reduce((sum, c) => sum + c.xpGained, 0);
  const xpEarnedFromBonuses = claimedRewards.reduce((sum, r) => sum + r.xpGained, 0);
  const totalXpEarned = xpEarnedFromCheckIns + xpEarnedFromBonuses;

  if (isBounded && effectiveEndDate) {
    const calendarDays = getInclusiveCalendarDays(effectiveStartDate, effectiveEndDate);
    const scheduledDates = getScheduledDatesInRange(habit, effectiveStartDate, effectiveEndDate);
    const scheduledCount = scheduledDates.length;

    let completedCount = 0;
    let missedCount = 0;
    let remainingCount = 0;

    const timeline: QuestTimelineDay[] = scheduledDates.map((date) => {
      if (completedDateSet.has(date)) {
        completedCount += 1;
        return { date, state: 'completed' };
      }
      if (date < referenceDate) {
        missedCount += 1;
        return { date, state: 'missed' };
      }
      remainingCount += 1;
      if (date === referenceDate) {
        return { date, state: 'pending_today' };
      }
      return { date, state: 'upcoming' };
    });

    const completionRate = scheduledCount > 0 ? completedCount / scheduledCount : 0;
    const minRequiredRate =
      scheduledCount > 0 && scheduledCount <= SHORT_QUEST_MAX_SCHEDULED_DAYS
        ? 1.0
        : QUEST_MIN_COMPLETION_RATE;

    const xpCalc = calculateDurationFixedXp(calendarDays, habit.difficulty, scheduledCount);
    const periodReward =
      claimedRewards.find((r) => r.rewardKey === 'period_completion') || null;

    const isFuture = isValidDateString(habit.startDate) && habit.startDate > referenceDate;
    const isPastEnd = referenceDate > effectiveEndDate;
    const isAllCompleted = scheduledCount > 0 && completedCount === scheduledCount;
    const metTargetAtEnd = isPastEnd && scheduledCount > 0 && completionRate >= minRequiredRate;

    let status: QuestLifecycleStatus;
    if (isFuture) {
      status = 'futura';
    } else if (periodReward || isAllCompleted || metTargetAtEnd) {
      status = 'concluida';
    } else if (isPastEnd) {
      status = 'encerrada';
    } else {
      status = 'ativa';
    }

    let daysRemaining = 0;
    if (referenceDate < effectiveStartDate) {
      daysRemaining = calendarDays;
    } else if (referenceDate <= effectiveEndDate) {
      daysRemaining = getInclusiveCalendarDays(referenceDate, effectiveEndDate);
    }

    const canStillReachMinTarget =
      scheduledCount > 0 && (completedCount + remainingCount) / scheduledCount >= minRequiredRate;

    return {
      habit,
      status,
      isBounded: true,
      effectiveStartDate,
      effectiveEndDate,
      calendarDays,
      tier: xpCalc.tier,
      tierLabel: xpCalc.label,
      tierShortLabel: xpCalc.shortLabel,
      scheduledCount,
      completedCount,
      missedCount,
      remainingCount,
      daysRemaining,
      completionRate,
      minRequiredRate,
      canStillReachMinTarget,
      projectedFixedXp: scheduledCount > 0 ? xpCalc.fixedXp : 0,
      perfectFixedXp: scheduledCount > 0 ? xpCalc.perfectXp : 0,
      supportsPerfectBonus: scheduledCount > 0 && xpCalc.supportsPerfectBonus,
      xpEarnedFromCheckIns,
      xpEarnedFromBonuses,
      totalXpEarned,
      claimedRewards,
      periodReward,
      milestones: [],
      nextMilestone: null,
      timeline,
    };
  }

  // Quest continua (sem data final)
  const completedCount = completedDateSet.size;
  const claimedKeys = new Set(claimedRewards.map((r) => r.rewardKey));

  const milestones: ContinuousMilestoneProgress[] = CONTINUOUS_MILESTONES.map((m) => ({
    days: m.days,
    label: m.label,
    tier: m.tier,
    xpReward: calculateMilestoneXp(m.days, habit.difficulty),
    achieved: claimedKeys.has(`milestone:${m.days}`),
    remainingCheckIns: Math.max(0, m.days - completedCount),
  }));

  const nextMilestone =
    milestones.find((m) => !m.achieved && completedCount < m.days) ||
    milestones.find((m) => !m.achieved) ||
    null;

  const targetDays = nextMilestone
    ? nextMilestone.days
    : CONTINUOUS_MILESTONES[CONTINUOUS_MILESTONES.length - 1].days;

  const isFuture = isValidDateString(habit.startDate) && habit.startDate > referenceDate;
  const timeline = isFuture
    ? []
    : getRecentContinuousTimeline(habit, effectiveStartDate, referenceDate, completedDateSet);
  const missedCount = timeline.filter((d) => d.state === 'missed').length;

  return {
    habit,
    status: isFuture ? 'futura' : 'continua',
    isBounded: false,
    effectiveStartDate,
    effectiveEndDate: null,
    calendarDays: 0,
    tier: 'continua',
    tierLabel: 'Contínua (Sem prazo)',
    tierShortLabel: 'Contínua',
    scheduledCount: targetDays,
    completedCount,
    missedCount,
    remainingCount: nextMilestone ? nextMilestone.remainingCheckIns : 0,
    daysRemaining: null,
    completionRate: targetDays > 0 ? Math.min(1, completedCount / targetDays) : 0,
    minRequiredRate: 1.0,
    canStillReachMinTarget: true,
    projectedFixedXp: nextMilestone ? nextMilestone.xpReward : 0,
    perfectFixedXp: nextMilestone ? nextMilestone.xpReward : 0,
    supportsPerfectBonus: false,
    xpEarnedFromCheckIns,
    xpEarnedFromBonuses,
    totalXpEarned,
    claimedRewards,
    periodReward: null,
    milestones,
    nextMilestone,
    timeline,
  };
}

/**
 * Avalia quais quests ja cumpriram criterios para liberar novos bonus de duracao ou marcos
 */
export function evaluateEligibleQuestRewards(
  habits: Habit[],
  checkIns: CheckInRecord[],
  existingRewards: QuestRewardRecord[],
  referenceDate: string
): PendingQuestReward[] {
  const pending: PendingQuestReward[] = [];

  for (const habit of habits) {
    if (habit.archived) {
      continue;
    }

    const existingForHabit = existingRewards.filter((r) => r.habitId === habit.id);
    const existingKeys = new Set(existingForHabit.map((r) => r.rewardKey));

    if (isValidDateString(habit.endDate)) {
      const rewardKey = 'period_completion';
      if (existingKeys.has(rewardKey)) {
        continue;
      }

      const effectiveStartDate = getEffectiveStartDate(habit, referenceDate);
      const calendarDays = getInclusiveCalendarDays(effectiveStartDate, habit.endDate);
      const scheduledDates = getScheduledDatesInRange(habit, effectiveStartDate, habit.endDate);
      const scheduledCount = scheduledDates.length;

      if (scheduledCount === 0) {
        continue;
      }

      const completedDateSet = new Set(
        checkIns.filter((c) => c.habitId === habit.id).map((c) => c.date)
      );
      const completedCount = scheduledDates.filter((d) => completedDateSet.has(d)).length;
      const completionRate = completedCount / scheduledCount;
      const minRequiredRate =
        scheduledCount <= SHORT_QUEST_MAX_SCHEDULED_DAYS ? 1.0 : QUEST_MIN_COMPLETION_RATE;

      const reachedAll = completedCount === scheduledCount;
      const endedWithMinTarget = referenceDate > habit.endDate && completionRate >= minRequiredRate;

      if (!reachedAll && !endedWithMinTarget) {
        continue;
      }

      const xpCalc = calculateDurationFixedXp(calendarDays, habit.difficulty, scheduledCount);
      const isPerfect = reachedAll && xpCalc.supportsPerfectBonus;
      const kind: QuestRewardKind = isPerfect ? 'period_perfect' : 'period_completion';
      const xpGained = isPerfect ? xpCalc.perfectXp : xpCalc.fixedXp;

      pending.push({
        habitId: habit.id,
        rewardKey,
        kind,
        tier: xpCalc.tier,
        xpGained,
        attributeGained: habit.category,
        completionRate,
        triggerDate: referenceDate,
      });
    } else {
      const completedCount = new Set(
        checkIns.filter((c) => c.habitId === habit.id).map((c) => c.date)
      ).size;

      for (const milestone of CONTINUOUS_MILESTONES) {
        const rewardKey = `milestone:${milestone.days}`;
        if (completedCount >= milestone.days && !existingKeys.has(rewardKey)) {
          pending.push({
            habitId: habit.id,
            rewardKey,
            kind: 'continuous_milestone',
            tier: milestone.tier,
            milestoneDays: milestone.days,
            xpGained: calculateMilestoneXp(milestone.days, habit.difficulty),
            attributeGained: habit.category,
            completionRate: 1,
            triggerDate: referenceDate,
          });
        }
      }
    }
  }

  return pending;
}
