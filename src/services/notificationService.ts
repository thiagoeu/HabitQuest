import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types';
import { getRandomMotivationalQuote } from '../domain/motivationalQuotes';
import { calculateXpGain } from '../domain/gamificationEngine';

export const NOTIFICATION_CHANNEL_ID = 'habit-alarms';
export const HABIT_REMINDER_CATEGORY = 'HABIT_REMINDER';

/**
 * Configura o comportamento padrao de exibicao das notificacoes em primeiro plano
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Calcula o horario e dia da semana para aviso previo com antecedencia configuravel (ex: 10 minutos)
 */
export function calculateEarlyReminderTime(
  hour: number,
  minute: number,
  dayOfWeek: number,
  offsetMinutes: number = 10
): { hour: number; minute: number; dayOfWeek: number } {
  let newMinute = minute - offsetMinutes;
  let newHour = hour;
  let newDay = dayOfWeek;

  if (newMinute < 0) {
    const borrowHours = Math.ceil(Math.abs(newMinute) / 60);
    newMinute = (newMinute + borrowHours * 60) % 60;
    newHour = hour - borrowHours;

    if (newHour < 0) {
      newHour = (newHour + 24) % 24;
      newDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }
  }

  return { hour: newHour, minute: newMinute, dayOfWeek: newDay };
}

/**
 * Solicita permissao ao usuario para envio de notificacoes
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return (
    requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/**
 * Configura o canal de alta prioridade (Android) e as acoes rapidas de interacao
 */
export async function setupNotificationChannelAndCategories(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Despertadores de Metas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
      sound: 'default',
    });
  }

  await Notifications.setNotificationCategoryAsync(HABIT_REMINDER_CATEGORY, [
    {
      identifier: 'COMPLETE_HABIT',
      buttonTitle: 'Concluir meta',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'OPEN_APP',
      buttonTitle: 'Abrir agora',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}

/**
 * Agenda os disparos de notificacoes recorrentes para os dias da semana e horario do habito,
 * incluindo aviso previo opcional de 10 minutos.
 */
export async function scheduleHabitReminder(habit: Habit): Promise<string[]> {
  if (!habit.reminderEnabled || !habit.reminderTime || habit.daysOfWeek.length === 0) {
    return [];
  }

  const [hourStr, minuteStr] = habit.reminderTime.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) {
    return [];
  }

  const scheduledIds: string[] = [];
  const quote = getRandomMotivationalQuote();
  const xpReward = calculateXpGain(habit.difficulty, habit.currentStreak);

  for (const day of habit.daysOfWeek) {
    // 1. Notificacao de Aviso Previo de 10 minutos (se habilitada)
    if (habit.earlyReminderEnabled) {
      const early = calculateEarlyReminderTime(hour, minute, day, 10);
      const earlyExpoWeekday = early.dayOfWeek + 1;

      try {
        const earlyId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Aviso: 10 minutos para sua meta`,
            body: `Sua meta '${habit.title}' começa em breve. Prepare-se!`,
            categoryIdentifier: HABIT_REMINDER_CATEGORY,
            data: {
              habitId: habit.id,
              habitTitle: habit.title,
              isEarlyWarning: true,
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: earlyExpoWeekday,
            hour: early.hour,
            minute: early.minute,
          },
        });

        scheduledIds.push(earlyId);
      } catch {
        // Ignora erro de agendamento individual
      }
    }

    // 2. Notificacao Principal no horario exato
    const expoWeekday = day + 1;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hora da meta: ${habit.title}`,
          body: `${quote}\nRecompensa: +${xpReward} XP em jogo!`,
          categoryIdentifier: HABIT_REMINDER_CATEGORY,
          data: {
            habitId: habit.id,
            habitTitle: habit.title,
            isEarlyWarning: false,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour,
          minute,
        },
      });

      scheduledIds.push(id);
    } catch {
      // Ignora erro de agendamento individual
    }
  }

  return scheduledIds;
}

/**
 * Cancela notificacoes agendadas anteriormente
 */
export async function cancelHabitNotifications(notificationIds?: string[]): Promise<void> {
  if (!notificationIds || notificationIds.length === 0) {
    return;
  }

  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignora caso ja tenha sido cancelado
    }
  }
}
