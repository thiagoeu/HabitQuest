import {
  calculateXpGain,
  getRequiredXPForLevel,
  applyXpGain,
  revertXpGain,
  calculateAttributeLevel,
  processHabitCompletion,
  revertHabitCompletion,
  applyQuestReward,
  revertQuestReward,
  evaluateMissedHabits,
  createInitialProfile,
  BASE_XP,
} from '../gamificationEngine';
import { Habit, CheckInRecord, UserProfile } from '../../types';

describe('gamificationEngine', () => {
  const mockHabit: Habit = {
    id: 'h-1',
    title: 'Estudar Programacao',
    category: 'intelecto',
    difficulty: 'medio',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderEnabled: false,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  };

  test('calcula XP base e streak bonus corretamente', () => {
    expect(calculateXpGain('facil', 0)).toBe(15);
    expect(calculateXpGain('medio', 0)).toBe(30);
    expect(calculateXpGain('dificil', 0)).toBe(50);

    // Com streak >= 3 dias, aplica 20% de bonus
    expect(calculateXpGain('facil', 3)).toBe(18); // 15 * 1.2 = 18
    expect(calculateXpGain('medio', 3)).toBe(36); // 30 * 1.2 = 36
    expect(calculateXpGain('dificil', 4)).toBe(60); // 50 * 1.2 = 60
  });

  test('aplica ganho de XP e sobe de nivel quando atinge o limite', () => {
    // Level 1 precisa de 100 XP
    const r1 = applyXpGain(1, 0, 50);
    expect(r1.level).toBe(1);
    expect(r1.currentXP).toBe(50);
    expect(r1.leveledUp).toBe(false);

    const r2 = applyXpGain(1, 80, 40); // total 120 -> sobe para nivel 2 com 20 XP
    expect(r2.level).toBe(2);
    expect(r2.currentXP).toBe(20);
    expect(r2.leveledUp).toBe(true);
  });

  test('reverte XP e nivel corretamente ao desfazer check-in', () => {
    const reverted = revertXpGain(2, 20, 40);
    expect(reverted.level).toBe(1);
    expect(reverted.currentXP).toBe(80);
  });

  test('calcula nivel de atributo a cada 150 pontos', () => {
    expect(calculateAttributeLevel(0)).toBe(1);
    expect(calculateAttributeLevel(149)).toBe(1);
    expect(calculateAttributeLevel(150)).toBe(2);
    expect(calculateAttributeLevel(300)).toBe(3);
  });

  test('processa conclusao de habito incrementando streak, XP, atributo e HP', () => {
    const profile = createInitialProfile();
    const result = processHabitCompletion(profile, mockHabit);

    expect(result.newStreak).toBe(1);
    expect(result.newBestStreak).toBe(1);
    expect(result.updatedProfile.currentXP).toBe(30);
    expect(result.updatedProfile.attributes.intelecto.points).toBe(30);
    expect(result.updatedProfile.attributes.forca.points).toBe(0);
    expect(result.checkInRecord.xpGained).toBe(30);
  });

  test('recupera vida em Segunda Chance e limpa flag', () => {
    const profile = {
      ...createInitialProfile(),
      hp: 0,
      inSecondChance: true,
    };

    const result = processHabitCompletion(profile, mockHabit);
    expect(result.updatedProfile.hp).toBe(30);
    expect(result.updatedProfile.inSecondChance).toBe(false);
  });

  test('aplica penalidade por metas perdidas e ativa Segunda Chance se HP chegar a zero', () => {
    const profile = {
      ...createInitialProfile(),
      hp: 15,
    };

    // 2 metas perdidas = 20 de dano, HP vai a 0
    const { updatedProfile, hpLost, activatedSecondChance } = evaluateMissedHabits(profile, 2);
    expect(hpLost).toBe(20);
    expect(updatedProfile.hp).toBe(0);
    expect(activatedSecondChance).toBe(true);
    expect(updatedProfile.inSecondChance).toBe(true);
  });

  test('reverte check-in estornando os pontos exatos do registro', () => {
    const initialProfile = createInitialProfile();
    const { updatedProfile, checkInRecord, newStreak } = processHabitCompletion(initialProfile, mockHabit);

    const fullRecord: CheckInRecord = {
      id: 'rec-1',
      habitId: mockHabit.id,
      date: '2026-11-16',
      completedAt: new Date().toISOString(),
      ...checkInRecord,
    };

    const habitWithStreak: Habit = {
      ...mockHabit,
      currentStreak: newStreak,
    };

    const reverted = revertHabitCompletion(updatedProfile, habitWithStreak, fullRecord);
    expect(reverted.revertedStreak).toBe(0);
    expect(reverted.updatedProfile.currentXP).toBe(0);
    expect(reverted.updatedProfile.attributes.intelecto.points).toBe(0);
  });

  test('concede pontos de expedicao proporcionais a dificuldade da tarefa', () => {
    const profile = createInitialProfile();

    const easyHabit: Habit = { ...mockHabit, difficulty: 'facil' };
    const mediumHabit: Habit = { ...mockHabit, difficulty: 'medio' };
    const hardHabit: Habit = { ...mockHabit, difficulty: 'dificil' };

    const rEasy = processHabitCompletion(profile, easyHabit);
    expect(rEasy.updatedProfile.expeditionPoints).toBe(5);

    const rMed = processHabitCompletion(profile, mediumHabit);
    expect(rMed.updatedProfile.expeditionPoints).toBe(10);

    const rHard = processHabitCompletion(profile, hardHabit);
    expect(rHard.updatedProfile.expeditionPoints).toBe(20);
  });

  test('aplica afinidade de classe no ganho de pontos do atributo', () => {
    const sageProfile: UserProfile = {
      ...createInitialProfile(),
      currentClass: 'sabio', // Sabio tem +25% de Intelecto
    };

    const result = processHabitCompletion(sageProfile, mockHabit); // Intelecto medio = 30 XP base
    // 30 * 1.25 = 37.5 -> 38 pontos
    expect(result.updatedProfile.attributes.intelecto.points).toBe(38);
    expect(result.checkInRecord.attributePointsGained).toBe(38);
  });

  test('aplica e estorna recompensa de bonus de quest com multi-level up e afinidade de classe', () => {
    const sageProfile: UserProfile = {
      ...createInitialProfile(),
      currentClass: 'sabio', // +25% em Intelecto
    };

    // Nivel 1 (100 XP) + Nivel 2 (200 XP) = 300 XP -> sobe para nivel 3 com 20 XP sobrando
    const applied = applyQuestReward(sageProfile, 'intelecto', 320);
    expect(applied.leveledUp).toBe(true);
    expect(applied.updatedProfile.level).toBe(3);
    expect(applied.updatedProfile.currentXP).toBe(20);
    expect(applied.attributePointsGained).toBe(400); // 320 * 1.25
    expect(applied.updatedProfile.attributes.intelecto.points).toBe(400);
    expect(applied.updatedProfile.attributes.intelecto.level).toBe(3);

    const reverted = revertQuestReward(applied.updatedProfile, {
      xpGained: 320,
      attributeGained: 'intelecto',
      attributePointsGained: applied.attributePointsGained,
    });
    expect(reverted.level).toBe(1);
    expect(reverted.currentXP).toBe(0);
    expect(reverted.attributes.intelecto.points).toBe(0);
    expect(reverted.attributes.intelecto.level).toBe(1);
  });
});
