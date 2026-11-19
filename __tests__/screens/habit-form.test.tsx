import { useAppStore } from '../../src/store/useAppStore';
import { deriveHabitDifficulty } from '../../src/domain/questProgressService';
import * as notificationService from '../../src/services/notificationService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/notificationService', () => ({
  scheduleHabitReminder: jest.fn(() => Promise.resolve(['mock-form-notif-1'])),
  cancelHabitNotifications: jest.fn(() => Promise.resolve()),
  requestNotificationPermissions: jest.fn(() => Promise.resolve(true)),
}));

describe('Fluxo e Integracao de Criacao de Metas com Dificuldade Automatica', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetStore();
  });

  test('calcula automaticamente dificuldade facil para meta de curta duracao e persiste no store', async () => {
    const store = useAppStore.getState();

    // Simulacao da inferencia automatica realizada pelo formulario
    const startDate = '2026-11-20';
    const endDate = '2026-11-23'; // 4 dias corridos
    const daysOfWeek = [1, 2, 3, 4, 5];

    const difficulty = deriveHabitDifficulty({ startDate, endDate, daysOfWeek });
    expect(difficulty).toBe('facil');

    const created = await store.addHabit({
      title: 'Meta Relampago de Leitura',
      category: 'intelecto',
      difficulty,
      daysOfWeek,
      startDate,
      endDate,
      reminderEnabled: false,
    });

    expect(created.difficulty).toBe('facil');
    expect(created.startDate).toBe('2026-11-20');
    expect(created.endDate).toBe('2026-11-23');
    expect(useAppStore.getState().habits).toHaveLength(1);
    expect(useAppStore.getState().habits[0].difficulty).toBe('facil');
  });

  test('calcula automaticamente dificuldade medio para meta de duracao intermediaria (7 a 27 dias)', async () => {
    const store = useAppStore.getState();

    const startDate = '2026-11-20';
    const endDate = '2026-12-04'; // 15 dias corridos
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];

    const difficulty = deriveHabitDifficulty({ startDate, endDate, daysOfWeek });
    expect(difficulty).toBe('medio');

    const created = await store.addHabit({
      title: 'Desafio Quinzenal de Treino',
      category: 'forca',
      difficulty,
      daysOfWeek,
      startDate,
      endDate,
      reminderEnabled: true,
      reminderTime: '07:30',
      earlyReminderEnabled: true,
    });

    expect(created.difficulty).toBe('medio');
    expect(created.reminderEnabled).toBe(true);
    expect(created.reminderTime).toBe('07:30');
    expect(created.earlyReminderEnabled).toBe(true);
    expect(notificationService.scheduleHabitReminder).toHaveBeenCalled();
  });

  test('calcula automaticamente dificuldade dificil para meta longa (28+ dias)', async () => {
    const store = useAppStore.getState();

    const startDate = '2026-11-01';
    const endDate = '2026-11-30'; // 30 dias corridos
    const daysOfWeek = [1, 2, 3, 4, 5];

    const difficulty = deriveHabitDifficulty({ startDate, endDate, daysOfWeek });
    expect(difficulty).toBe('dificil');

    const created = await store.addHabit({
      title: 'Jornada Mensal de Disciplina',
      category: 'disciplina',
      difficulty,
      daysOfWeek,
      startDate,
      endDate,
      reminderEnabled: false,
    });

    expect(created.difficulty).toBe('dificil');
  });

  test('no modo continuo (sem endDate), infere dificuldade conforme frequencia semanal de metas', async () => {
    const store = useAppStore.getState();

    // 2 dias/semana -> medio
    const diff2Days = deriveHabitDifficulty({
      startDate: '2026-11-20',
      endDate: null,
      daysOfWeek: [1, 4],
    });
    expect(diff2Days).toBe('medio');

    // 5 dias/semana -> dificil
    const diff5Days = deriveHabitDifficulty({
      startDate: '2026-11-20',
      endDate: null,
      daysOfWeek: [1, 2, 3, 4, 5],
    });
    expect(diff5Days).toBe('dificil');

    const createdContinuous = await store.addHabit({
      title: 'Estudar Programacao Todo Dia',
      category: 'intelecto',
      difficulty: diff5Days,
      daysOfWeek: [1, 2, 3, 4, 5],
      startDate: '2026-11-20',
      endDate: null,
      reminderEnabled: false,
    });

    expect(createdContinuous.difficulty).toBe('dificil');
    expect(createdContinuous.endDate).toBeNull();
  });
});
