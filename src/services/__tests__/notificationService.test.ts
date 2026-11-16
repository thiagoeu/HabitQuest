import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  setupNotificationChannelAndCategories,
  scheduleHabitReminder,
  cancelHabitNotifications,
  calculateEarlyReminderTime,
} from '../notificationService';
import { Habit } from '../../types';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  AndroidImportance: {
    MAX: 5,
  },
  IosAuthorizationStatus: {
    PROVISIONAL: 3,
  },
  SchedulableTriggerInputTypes: {
    WEEKLY: 'weekly',
  },
}));

describe('notificationService', () => {
  const mockHabit: Habit = {
    id: 'habit-123',
    title: 'Ir para a Academia',
    category: 'forca',
    difficulty: 'medio',
    daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
    reminderEnabled: true,
    reminderTime: '07:30',
    earlyReminderEnabled: false,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateEarlyReminderTime', () => {
    test('subtrai minutos normalmente no mesmo dia', () => {
      const res = calculateEarlyReminderTime(8, 30, 1, 10);
      expect(res).toEqual({ hour: 8, minute: 20, dayOfWeek: 1 });
    });

    test('trata virada de hora (ex: 08:05 menos 10 min vira 07:55)', () => {
      const res = calculateEarlyReminderTime(8, 5, 2, 10);
      expect(res).toEqual({ hour: 7, minute: 55, dayOfWeek: 2 });
    });

    test('trata virada de meia-noite e dia da semana (ex: 00:05 de segunda vira 23:55 de domingo)', () => {
      const res = calculateEarlyReminderTime(0, 5, 1, 10);
      expect(res).toEqual({ hour: 23, minute: 55, dayOfWeek: 0 });
    });

    test('trata virada de domingo para sabado (dia 0 vira dia 6)', () => {
      const res = calculateEarlyReminderTime(0, 0, 0, 10);
      expect(res).toEqual({ hour: 23, minute: 50, dayOfWeek: 6 });
    });
  });

  test('solicita permissao de notificacao quando nao concedida', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });

    const granted = await requestNotificationPermissions();
    expect(granted).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  test('configura categorias de acoes rapidas e canal Android', async () => {
    await setupNotificationChannelAndCategories();
    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      'HABIT_REMINDER',
      expect.arrayContaining([
        expect.objectContaining({ identifier: 'COMPLETE_HABIT' }),
        expect.objectContaining({ identifier: 'OPEN_APP' }),
      ])
    );
  });

  test('agenda lembretes semanais para cada dia configurado no habito', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('notif-1')
      .mockResolvedValueOnce('notif-2')
      .mockResolvedValueOnce('notif-3');

    const ids = await scheduleHabitReminder(mockHabit);
    expect(ids).toEqual(['notif-1', 'notif-2', 'notif-3']);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  test('agenda notificacao dupla quando aviso previo de 10 minutos esta habilitado', async () => {
    const habitWithEarly: Habit = {
      ...mockHabit,
      daysOfWeek: [1], // Segunda-feira
      earlyReminderEnabled: true,
    };

    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('notif-early')
      .mockResolvedValueOnce('notif-main');

    const ids = await scheduleHabitReminder(habitWithEarly);
    expect(ids).toEqual(['notif-early', 'notif-main']);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

    // Primeiro disparo eh o aviso previo
    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Aviso: 10 minutos para sua meta',
        }),
        trigger: expect.objectContaining({
          hour: 7,
          minute: 20,
        }),
      })
    );
  });

  test('cancela notificacoes passadas por ID', async () => {
    await cancelHabitNotifications(['notif-1', 'notif-2']);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-2');
  });

  test('nao agenda notificacoes se reminderEnabled for false', async () => {
    const disabledHabit = { ...mockHabit, reminderEnabled: false };
    const ids = await scheduleHabitReminder(disabledHabit);
    expect(ids).toEqual([]);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
