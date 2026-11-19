import {
  calculateDurationFixedXp,
  calculateMilestoneXp,
  computeQuestProgress,
  evaluateEligibleQuestRewards,
  getDurationTier,
  getInclusiveCalendarDays,
  getScheduledDatesInRange,
  isValidDateString,
  parseLocalDate,
  formatLocalDate,
} from '../questProgressService';
import { CheckInRecord, Habit, QuestRewardRecord } from '../../types';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    title: 'Estudar TypeScript',
    category: 'intelecto',
    difficulty: 'medio',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startDate: '2026-11-01',
    endDate: '2026-11-07',
    reminderEnabled: false,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: '2026-11-01T09:00:00.000Z',
    ...overrides,
  };
}

function makeCheckIn(habitId: string, date: string, xpGained = 30): CheckInRecord {
  return {
    id: `ci-${habitId}-${date}`,
    habitId,
    date,
    completedAt: `${date}T12:00:00.000Z`,
    xpGained,
    attributeGained: 'intelecto',
    attributePointsGained: xpGained,
    hpGained: 5,
  };
}

describe('questProgressService', () => {
  test('calcula dias inclusivos e valida datas sem deslocamento de fuso horario', () => {
    expect(isValidDateString('2026-11-19')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('invalida')).toBe(false);

    expect(getInclusiveCalendarDays('2026-11-19', '2026-11-25')).toBe(7);
    expect(getInclusiveCalendarDays('2026-11-01', '2026-11-30')).toBe(30);
    expect(getInclusiveCalendarDays('2026-12-29', '2027-01-04')).toBe(7);
    expect(getInclusiveCalendarDays('2026-11-10', '2026-11-05')).toBe(0);

    const parsed = parseLocalDate('2026-12-31');
    expect(formatLocalDate(parsed)).toBe('2026-12-31');
  });

  test('classifica todas as faixas de duracao e aplica multiplicadores de dificuldade (1.0x / 1.5x / 2.0x)', () => {
    expect(getDurationTier(1).tier).toBe('pontual');
    expect(getDurationTier(6).tier).toBe('pontual');
    expect(getDurationTier(7).tier).toBe('semanal');
    expect(getDurationTier(13).tier).toBe('semanal');
    expect(getDurationTier(14).tier).toBe('quinzenal');
    expect(getDurationTier(27).tier).toBe('quinzenal');
    expect(getDurationTier(28).tier).toBe('mensal');
    expect(getDurationTier(89).tier).toBe('mensal');
    expect(getDurationTier(90).tier).toBe('trimestral');

    // Pontual (1-6d): base 50
    expect(calculateDurationFixedXp(5, 'facil', 5)).toMatchObject({
      tier: 'pontual',
      fixedXp: 50,
      perfectXp: 60,
      supportsPerfectBonus: true,
    });
    expect(calculateDurationFixedXp(3, 'facil', 3)).toMatchObject({
      tier: 'pontual',
      fixedXp: 50,
      perfectXp: 50,
      supportsPerfectBonus: false,
    });

    // Semanal (7-13d): base 150
    expect(calculateDurationFixedXp(7, 'facil', 7).fixedXp).toBe(150);
    expect(calculateDurationFixedXp(7, 'medio', 7)).toMatchObject({
      tier: 'semanal',
      fixedXp: 225,
      perfectXp: 270,
      supportsPerfectBonus: true,
    });
    expect(calculateDurationFixedXp(7, 'dificil', 7).fixedXp).toBe(300);

    // Quinzenal (14-27d): base 350
    expect(calculateDurationFixedXp(14, 'facil', 14).fixedXp).toBe(350);
    expect(calculateDurationFixedXp(14, 'medio', 14).fixedXp).toBe(525);
    expect(calculateDurationFixedXp(14, 'dificil', 14).fixedXp).toBe(700);

    // Mensal (28-89d): base 800
    expect(calculateDurationFixedXp(30, 'facil', 30).fixedXp).toBe(800);
    expect(calculateDurationFixedXp(30, 'medio', 30).fixedXp).toBe(1200);
    expect(calculateDurationFixedXp(30, 'dificil', 30)).toMatchObject({
      tier: 'mensal',
      fixedXp: 1600,
      perfectXp: 1920,
    });

    // Trimestral (90+d): base 2200
    expect(calculateDurationFixedXp(90, 'facil', 90).fixedXp).toBe(2200);
    expect(calculateDurationFixedXp(90, 'medio', 90).fixedXp).toBe(3300);
    expect(calculateDurationFixedXp(90, 'dificil', 90).fixedXp).toBe(4400);
  });

  test('regra de 100% para quests curtas (<= 3 dias programados)', () => {
    const shortHabit = makeHabit({
      difficulty: 'facil',
      startDate: '2026-11-02',
      endDate: '2026-11-04', // 3 dias
    });

    // Apenas 2 de 3 cumpridos apos encerramento -> nao libera
    const twoOfThree = [
      makeCheckIn(shortHabit.id, '2026-11-02'),
      makeCheckIn(shortHabit.id, '2026-11-03'),
    ];
    expect(evaluateEligibleQuestRewards([shortHabit], twoOfThree, [], '2026-11-05')).toEqual([]);

    // 3 de 3 cumpridos -> libera valor fixo sem +20% Perfeita
    const threeOfThree = [...twoOfThree, makeCheckIn(shortHabit.id, '2026-11-04')];
    const rewards = evaluateEligibleQuestRewards([shortHabit], threeOfThree, [], '2026-11-04');
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({
      kind: 'period_completion',
      xpGained: 50,
      completionRate: 1,
    });
  });

  test('regra de 80% ao encerrar e bonus Quest Perfeita +20% ao concluir 100%', () => {
    const tenDayHabit = makeHabit({
      difficulty: 'medio',
      startDate: '2026-11-01',
      endDate: '2026-11-10', // 10 dias -> faixa semanal (225 XP, perfeita 270 XP)
    });

    const dates = getScheduledDatesInRange(tenDayHabit, '2026-11-01', '2026-11-10');
    expect(dates).toHaveLength(10);

    // 7/10 (70%) apos encerramento -> nao libera e status vira encerrada
    const checkIns7 = dates.slice(0, 7).map((d) => makeCheckIn(tenDayHabit.id, d));
    expect(evaluateEligibleQuestRewards([tenDayHabit], checkIns7, [], '2026-11-11')).toEqual([]);
    expect(computeQuestProgress(tenDayHabit, checkIns7, [], '2026-11-11').status).toBe('encerrada');

    // 8/10 (80%) durante o prazo -> ainda nao libera antes do fim
    const checkIns8 = dates.slice(0, 8).map((d) => makeCheckIn(tenDayHabit.id, d));
    expect(evaluateEligibleQuestRewards([tenDayHabit], checkIns8, [], '2026-11-10')).toEqual([]);

    // 8/10 (80%) apos o fim -> libera bonus fixo padrao (225 XP)
    const reward80 = evaluateEligibleQuestRewards([tenDayHabit], checkIns8, [], '2026-11-11');
    expect(reward80).toHaveLength(1);
    expect(reward80[0]).toMatchObject({
      kind: 'period_completion',
      xpGained: 225,
      completionRate: 0.8,
    });

    // 10/10 (100%) no ultimo dia -> libera imediatamente Quest Perfeita (+20% = 270 XP)
    const checkIns10 = dates.map((d) => makeCheckIn(tenDayHabit.id, d));
    const reward100 = evaluateEligibleQuestRewards([tenDayHabit], checkIns10, [], '2026-11-10');
    expect(reward100).toHaveLength(1);
    expect(reward100[0]).toMatchObject({
      kind: 'period_perfect',
      xpGained: 270,
      completionRate: 1,
    });
  });

  test('calcula marcos continuos (7, 30, 90, 180, 365) e evita pagamentos duplicados', () => {
    expect(calculateMilestoneXp(7, 'medio')).toBe(225);
    expect(calculateMilestoneXp(30, 'dificil')).toBe(1600);
    expect(calculateMilestoneXp(90, 'facil')).toBe(2200);
    expect(calculateMilestoneXp(180, 'medio')).toBe(6000);
    expect(calculateMilestoneXp(365, 'dificil')).toBe(16000);

    const continuousHabit = makeHabit({
      id: 'habit-cont',
      difficulty: 'medio',
      startDate: null,
      endDate: null,
      createdAt: '2026-01-01T08:00:00.000Z',
    });

    const checkIns30 = Array.from({ length: 30 }, (_, idx) => {
      const d = new Date(2026, 0, 1 + idx);
      return makeCheckIn(continuousHabit.id, formatLocalDate(d));
    });

    const existingReward7: QuestRewardRecord = {
      id: 'qr-1',
      habitId: continuousHabit.id,
      rewardKey: 'milestone:7',
      kind: 'continuous_milestone',
      tier: 'semanal',
      milestoneDays: 7,
      xpGained: 225,
      attributeGained: 'intelecto',
      attributePointsGained: 225,
      completionRate: 1,
      awardedAt: '2026-01-08T12:00:00.000Z',
      triggerDate: '2026-01-07',
    };

    const pending = evaluateEligibleQuestRewards(
      [continuousHabit],
      checkIns30,
      [existingReward7],
      '2026-01-30'
    );
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      rewardKey: 'milestone:30',
      milestoneDays: 30,
      xpGained: 1200,
    });

    const summary = computeQuestProgress(
      continuousHabit,
      checkIns30,
      [existingReward7],
      '2026-01-30'
    );
    expect(summary.status).toBe('continua');
    expect(summary.nextMilestone?.days).toBe(90);
    expect(summary.nextMilestone?.remainingCheckIns).toBe(60);
    expect(summary.timeline.length).toBeLessThanOrEqual(30);
  });

  test('trata intervalo com zero dias programados e quests futuras sem divisao por zero', () => {
    // 2026-11-21 (Sab) e 2026-11-22 (Dom) com habito configurado so seg-sex
    const weekendEmptyHabit = makeHabit({
      daysOfWeek: [1, 2, 3, 4, 5],
      startDate: '2026-11-21',
      endDate: '2026-11-22',
    });

    const summary = computeQuestProgress(weekendEmptyHabit, [], [], '2026-11-25');
    expect(summary.scheduledCount).toBe(0);
    expect(summary.completionRate).toBe(0);
    expect(summary.status).toBe('encerrada');
    expect(summary.canStillReachMinTarget).toBe(false);
    expect(evaluateEligibleQuestRewards([weekendEmptyHabit], [], [], '2026-11-25')).toEqual([]);

    // Quest futura
    const futureHabit = makeHabit({
      startDate: '2026-12-01',
      endDate: '2026-12-07',
    });
    const futureSummary = computeQuestProgress(futureHabit, [], [], '2026-11-20');
    expect(futureSummary.status).toBe('futura');
    expect(futureSummary.daysRemaining).toBe(7);
  });
});
