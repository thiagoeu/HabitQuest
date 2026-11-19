import { useAppStore } from '../useAppStore';
import * as notificationService from '../../services/notificationService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../services/notificationService', () => ({
  scheduleHabitReminder: jest.fn(() => Promise.resolve(['mock-notif-1'])),
  cancelHabitNotifications: jest.fn(() => Promise.resolve()),
}));

describe('useAppStore with date ranges and notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetStore();
  });

  test('agenda notificacoes ao adicionar habito com lembrete habilitado', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Treinar Peito e Triceps',
      category: 'forca',
      difficulty: 'dificil',
      daysOfWeek: [1, 3, 5],
      reminderEnabled: true,
      reminderTime: '18:00',
    });

    expect(notificationService.scheduleHabitReminder).toHaveBeenCalled();
    expect(habit.notificationIds).toEqual(['mock-notif-1']);
    expect(useAppStore.getState().habits[0].notificationIds).toEqual(['mock-notif-1']);
  });

  test('permite criar habito sem horario e sem lembrete', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Beber 2L de agua',
      category: 'forca',
      difficulty: 'facil',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: false,
      reminderTime: null,
    });

    expect(habit.reminderEnabled).toBe(false);
    expect(habit.reminderTime).toBeNull();
    expect(notificationService.scheduleHabitReminder).not.toHaveBeenCalled();
  });

  test('filtra habitos pelo intervalo de vigencia no calendario (startDate e endDate)', async () => {
    const store = useAppStore.getState();

    // Habito com vigencia de 2026-11-20 a 2026-11-25 (todos os dias)
    await store.addHabit({
      title: 'Desafio de 5 dias',
      category: 'disciplina',
      difficulty: 'medio',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-20',
      endDate: '2026-11-25',
      reminderEnabled: false,
    });

    // Antes da data de inicio -> nao deve aparecer
    const beforeList = store.getHabitsForDate('2026-11-19');
    expect(beforeList.length).toBe(0);

    // Durante a vigencia -> deve aparecer
    const duringList = store.getHabitsForDate('2026-11-22');
    expect(duringList.length).toBe(1);
    expect(duringList[0].title).toBe('Desafio de 5 dias');

    // Apos a data de fim -> nao deve aparecer
    const afterList = store.getHabitsForDate('2026-11-26');
    expect(afterList.length).toBe(0);
  });

  test('cancela notificacoes antigas e reagenda ao atualizar horario do habito', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Treino de Forca',
      category: 'forca',
      difficulty: 'medio',
      daysOfWeek: [1, 3],
      reminderEnabled: true,
      reminderTime: '08:00',
    });

    await store.updateHabit(habit.id, { reminderTime: '09:00' });
    expect(notificationService.cancelHabitNotifications).toHaveBeenCalledWith(['mock-notif-1']);
    expect(notificationService.scheduleHabitReminder).toHaveBeenCalledTimes(2);
  });

  test('cancela notificacoes ao excluir habito', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Treino de Corrida',
      category: 'forca',
      difficulty: 'medio',
      daysOfWeek: [2, 4],
      reminderEnabled: true,
      reminderTime: '06:30',
    });

    await store.deleteHabit(habit.id);
    expect(notificationService.cancelHabitNotifications).toHaveBeenCalledWith(['mock-notif-1']);
    expect(useAppStore.getState().habits.length).toBe(0);
  });

  test('executa check-in diario e concede recompensas de XP e atributos', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Ler 20 paginas',
      category: 'intelecto',
      difficulty: 'medio',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: false,
    });

    const { record } = store.completeHabit(habit.id, '2026-11-16');
    expect(record).not.toBeNull();
    expect(useAppStore.getState().checkIns.length).toBe(1);
    expect(useAppStore.getState().profile.currentXP).toBe(30);
    expect(useAppStore.getState().profile.attributes.intelecto.points).toBe(30);
    expect(useAppStore.getState().profile.globalStreak).toBe(1);
    expect(useAppStore.getState().isHabitCompletedOnDate(habit.id, '2026-11-16')).toBe(true);
  });

  test('desfaz check-in no mesmo dia estornando XP, atributos e streak', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Meditar 10 minutos',
      category: 'disciplina',
      difficulty: 'facil',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: false,
    });

    store.completeHabit(habit.id, '2026-11-16');
    expect(useAppStore.getState().profile.currentXP).toBe(15);
    expect(useAppStore.getState().habits[0].currentStreak).toBe(1);

    const reverted = store.uncompleteHabit(habit.id, '2026-11-16');
    expect(reverted).toBe(true);
    expect(useAppStore.getState().checkIns.length).toBe(0);
    expect(useAppStore.getState().profile.currentXP).toBe(0);
    expect(useAppStore.getState().habits[0].currentStreak).toBe(0);
  });

  test('avalia virada de dia e aplica dano de HP apenas para habitos ativos no periodo', async () => {
    const store = useAppStore.getState();

    // Habito que ja encerrou antes da data avaliada
    await store.addHabit({
      title: 'Habito expirado',
      category: 'forca',
      difficulty: 'medio',
      daysOfWeek: [1], // Segunda-feira
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      reminderEnabled: false,
    });

    // Habito ativo na segunda-feira 2026-11-16
    await store.addHabit({
      title: 'Habito ativo nao cumprido',
      category: 'forca',
      difficulty: 'medio',
      daysOfWeek: [1], // Segunda-feira
      startDate: '2026-11-15',
      endDate: '2026-11-20',
      reminderEnabled: false,
    });

    useAppStore.setState({ lastEvaluatedDate: '2026-11-16' });

    // Avalia terca-feira 2026-11-17: apenas o habito ativo gera dano (-10 HP)
    const { hpLost } = store.evaluateDayChange('2026-11-17');
    expect(hpLost).toBe(10);
    expect(useAppStore.getState().profile.hp).toBe(90);
    expect(useAppStore.getState().lastEvaluatedDate).toBe('2026-11-17');
  });

  test('permite evoluir de classe e atualizar perfil com vitorias de batalha', () => {
    const store = useAppStore.getState();

    // Configura perfil qualificado para Cavaleiro (Level >= 5, Força >= 20)
    useAppStore.setState({
      profile: {
        ...store.profile,
        level: 5,
        attributes: {
          ...store.profile.attributes,
          forca: { points: 30, level: 1 },
        },
      },
    });

    const evolveResult = store.evolveOrSwitchClass('cavaleiro');
    expect(evolveResult.success).toBe(true);
    expect(useAppStore.getState().profile.currentClass).toBe('cavaleiro');
    expect(useAppStore.getState().profile.unlockedClasses).toContain('cavaleiro');

    // Concede recompensas de batalha
    store.updateProfileAfterBattle(15, 60, 50);
    const updated = useAppStore.getState().profile;
    expect(updated.goldBalance).toBe(50);
    expect(updated.currentXP).toBe(60);
  });

  test('concede bonus Quest Perfeita ao fechar 100% de quest semanal e estorna se desfeito no mesmo dia', async () => {
    const store = useAppStore.getState();

    const habit = await store.addHabit({
      title: 'Desafio Semanal Leitura',
      category: 'intelecto',
      difficulty: 'medio', // 30 XP/dia (+20% streak = 36 XP/dia a partir do 4o check-in)
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-01',
      endDate: '2026-11-07', // 7 dias -> semanal medio = 225 XP; perfeita = 270 XP
      reminderEnabled: false,
    });

    const days = [
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ];
    for (const d of days) {
      const res = store.completeHabit(habit.id, d);
      expect(res.unlockedQuestRewards).toHaveLength(0);
    }

    const pointsBeforeFinalDay = useAppStore.getState().profile.attributes.intelecto.points;

    // 7o dia -> libera 270 XP de Quest Perfeita imediatamente
    const finalResult = store.completeHabit(habit.id, '2026-11-07');
    expect(finalResult.unlockedQuestRewards).toHaveLength(1);
    expect(finalResult.unlockedQuestRewards[0]).toMatchObject({
      kind: 'period_perfect',
      xpGained: 270,
      rewardKey: 'period_completion',
    });
    expect(useAppStore.getState().questRewards).toHaveLength(1);
    // 36 do check-in + 270 do bonus = +306 pontos em Intelecto
    expect(useAppStore.getState().profile.attributes.intelecto.points).toBe(
      pointsBeforeFinalDay + 36 + 270
    );

    // Idempotencia: virada de dia nao paga novamente
    const dayChangeRes = store.evaluateDayChange('2026-11-08');
    expect(dayChangeRes.unlockedQuestRewards).toHaveLength(0);
    expect(useAppStore.getState().questRewards).toHaveLength(1);

    // Desmarca o ultimo dia no mesmo dia -> estorna o check-in e o bonus de 270 XP
    const reverted = store.uncompleteHabit(habit.id, '2026-11-07');
    expect(reverted).toBe(true);
    expect(useAppStore.getState().questRewards).toHaveLength(0);
    expect(useAppStore.getState().profile.attributes.intelecto.points).toBe(pointsBeforeFinalDay);
  });

  test('concede bonus na virada de dia apenas para quests com pelo menos 80% de aderencia', async () => {
    const store = useAppStore.getState();

    // Quest A: 10 dias, cumprida em 8 (80%) -> ganha 225 XP ao virar o prazo
    const habit80 = await store.addHabit({
      title: 'Quest 80%',
      category: 'disciplina',
      difficulty: 'medio',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      reminderEnabled: false,
    });

    // Quest B: 10 dias, cumprida em 7 (70%) -> nao ganha bonus
    const habit70 = await store.addHabit({
      title: 'Quest 70%',
      category: 'forca',
      difficulty: 'medio',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      reminderEnabled: false,
    });

    for (let day = 1; day <= 8; day += 1) {
      store.completeHabit(habit80.id, `2026-11-${String(day).padStart(2, '0')}`);
    }
    for (let day = 1; day <= 7; day += 1) {
      store.completeHabit(habit70.id, `2026-11-${String(day).padStart(2, '0')}`);
    }

    expect(useAppStore.getState().questRewards).toHaveLength(0);

    useAppStore.setState({ lastEvaluatedDate: '2026-11-10' });
    const result = store.evaluateDayChange('2026-11-11');

    expect(result.unlockedQuestRewards).toHaveLength(1);
    expect(result.unlockedQuestRewards[0]).toMatchObject({
      habitId: habit80.id,
      kind: 'period_completion',
      xpGained: 225,
    });
    expect(useAppStore.getState().questRewards).toHaveLength(1);
  });

  test('concede e estorna marco de 7 check-ins em quest continua ao desfazer no mesmo dia', async () => {
    const store = useAppStore.getState();

    const continuousHabit = await store.addHabit({
      title: 'Meditar Todos os Dias',
      category: 'disciplina',
      difficulty: 'medio',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      reminderEnabled: false,
    });

    for (let day = 1; day <= 6; day += 1) {
      store.completeHabit(continuousHabit.id, `2026-11-0${day}`);
    }
    const disciplineBefore7th = useAppStore.getState().profile.attributes.disciplina.points;

    // 7o check-in dispara marco de 7 dias (+225 XP)
    const seventh = store.completeHabit(continuousHabit.id, '2026-11-07');
    expect(seventh.unlockedQuestRewards).toHaveLength(1);
    expect(seventh.unlockedQuestRewards[0]).toMatchObject({
      kind: 'continuous_milestone',
      milestoneDays: 7,
      xpGained: 225,
    });
    expect(useAppStore.getState().profile.attributes.disciplina.points).toBe(
      disciplineBefore7th + 36 + 225
    );

    // Desmarca o 7o check-in no mesmo dia -> estorna marco de 7 dias
    store.uncompleteHabit(continuousHabit.id, '2026-11-07');
    expect(useAppStore.getState().questRewards).toHaveLength(0);
    expect(useAppStore.getState().profile.attributes.disciplina.points).toBe(disciplineBefore7th);
  });
});
