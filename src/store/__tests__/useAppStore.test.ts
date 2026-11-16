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
});
