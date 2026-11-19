import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Habit,
  CheckInRecord,
  UserProfile,
  Achievement,
  CharacterClassId,
  QuestRewardRecord,
} from '../types';
import {
  createInitialProfile,
  processHabitCompletion,
  revertHabitCompletion,
  evaluateMissedHabits,
  applyXpGain,
  applyQuestReward,
  revertQuestReward,
} from '../domain/gamificationEngine';
import {
  evaluateEligibleQuestRewards,
  getEffectiveStartDate,
  getScheduledDatesInRange,
  isValidDateString,
  QUEST_MIN_COMPLETION_RATE,
  SHORT_QUEST_MAX_SCHEDULED_DAYS,
} from '../domain/questProgressService';
import { evolveOrSwitchClass as domainEvolveOrSwitchClass } from '../domain/classProgressionService';
import { INITIAL_ACHIEVEMENTS, evaluateAchievements } from '../domain/achievementsCatalog';
import { scheduleHabitReminder, cancelHabitNotifications } from '../services/notificationService';

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function applyPendingQuestRewardsForStore(
  habits: Habit[],
  checkIns: CheckInRecord[],
  existingRewards: QuestRewardRecord[],
  profile: UserProfile,
  referenceDate: string
): {
  updatedProfile: UserProfile;
  updatedQuestRewards: QuestRewardRecord[];
  unlockedQuestRewards: QuestRewardRecord[];
} {
  const pendingRewards = evaluateEligibleQuestRewards(
    habits,
    checkIns,
    existingRewards,
    referenceDate
  );

  if (pendingRewards.length === 0) {
    return {
      updatedProfile: profile,
      updatedQuestRewards: existingRewards,
      unlockedQuestRewards: [],
    };
  }

  let currentProfile = profile;
  const newlyUnlocked: QuestRewardRecord[] = [];
  const nowIso = new Date().toISOString();

  for (const pending of pendingRewards) {
    const { updatedProfile, attributePointsGained } = applyQuestReward(
      currentProfile,
      pending.attributeGained,
      pending.xpGained
    );
    currentProfile = updatedProfile;

    newlyUnlocked.push({
      id: `qreward-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      habitId: pending.habitId,
      rewardKey: pending.rewardKey,
      kind: pending.kind,
      tier: pending.tier,
      milestoneDays: pending.milestoneDays,
      xpGained: pending.xpGained,
      attributeGained: pending.attributeGained,
      attributePointsGained,
      completionRate: pending.completionRate,
      awardedAt: nowIso,
      triggerDate: pending.triggerDate,
    });
  }

  return {
    updatedProfile: currentProfile,
    updatedQuestRewards: [...existingRewards, ...newlyUnlocked],
    unlockedQuestRewards: newlyUnlocked,
  };
}

export interface AppState {
  habits: Habit[];
  checkIns: CheckInRecord[];
  questRewards: QuestRewardRecord[];
  profile: UserProfile;
  achievements: Achievement[];
  lastEvaluatedDate: string | null;

  // Actions
  addHabit: (data: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'createdAt'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, customDate?: string) => {
    leveledUp: boolean;
    unlockedAchievements: Achievement[];
    record: CheckInRecord | null;
    unlockedQuestRewards: QuestRewardRecord[];
  };
  uncompleteHabit: (habitId: string, customDate?: string) => boolean;
  evaluateDayChange: (todayStr?: string) => {
    hpLost: number;
    activatedSecondChance: boolean;
    unlockedQuestRewards: QuestRewardRecord[];
  };
  getHabitsForDate: (dateStr: string) => Habit[];
  isHabitCompletedOnDate: (habitId: string, dateStr: string) => boolean;
  evolveOrSwitchClass: (classId: CharacterClassId) => { success: boolean; error?: string };
  updateProfileAfterBattle: (
    expeditionSpent: number,
    xpAwarded: number,
    goldAwarded: number
  ) => { leveledUp: boolean };
  ensureProfileDefaults: () => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      habits: [],
      checkIns: [],
      questRewards: [],
      profile: createInitialProfile(),
      achievements: INITIAL_ACHIEVEMENTS,
      lastEvaluatedDate: null,

      addHabit: async (data) => {
        const id = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        let newHabit: Habit = {
          startDate: null,
          endDate: null,
          earlyReminderEnabled: false,
          ...data,
          id,
          currentStreak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
          notificationIds: [],
        };

        if (newHabit.reminderEnabled && newHabit.reminderTime) {
          const notificationIds = await scheduleHabitReminder(newHabit);
          newHabit = { ...newHabit, notificationIds };
        }

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));

        return newHabit;
      },

      updateHabit: async (id, updates) => {
        const existing = get().habits.find((h) => h.id === id);
        if (!existing) return;

        // Cancela alarmes antigos
        if (existing.notificationIds && existing.notificationIds.length > 0) {
          await cancelHabitNotifications(existing.notificationIds);
        }

        const merged: Habit = {
          ...existing,
          ...updates,
          notificationIds: [],
        };

        if (merged.reminderEnabled && merged.reminderTime) {
          const newNotificationIds = await scheduleHabitReminder(merged);
          merged.notificationIds = newNotificationIds;
        }

        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? merged : h)),
        }));
      },

      deleteHabit: async (id) => {
        const existing = get().habits.find((h) => h.id === id);
        if (existing?.notificationIds && existing.notificationIds.length > 0) {
          await cancelHabitNotifications(existing.notificationIds);
        }

        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      completeHabit: (habitId, customDate) => {
        const state = get();
        const dateStr = customDate || getTodayDateString();
        const currentQuestRewards = state.questRewards || [];

        // Evita duplicatas no mesmo dia
        const existingCheckIn = state.checkIns.find(
          (c) => c.habitId === habitId && c.date === dateStr
        );
        if (existingCheckIn) {
          return {
            leveledUp: false,
            unlockedAchievements: [],
            record: null,
            unlockedQuestRewards: [],
          };
        }

        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) {
          return {
            leveledUp: false,
            unlockedAchievements: [],
            record: null,
            unlockedQuestRewards: [],
          };
        }

        const wasInSecondChance = state.profile.inSecondChance;

        // Processa regras de gamificacao
        const { updatedProfile, checkInRecord, newStreak, newBestStreak } = processHabitCompletion(
          state.profile,
          habit
        );

        const newRecord: CheckInRecord = {
          id: `checkin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          habitId,
          date: dateStr,
          completedAt: new Date().toISOString(),
          ...checkInRecord,
        };

        const updatedCheckIns = [...state.checkIns, newRecord];

        // Atualiza ofensiva global (se hoje for a primeira meta cumprida)
        const checkInsToday = updatedCheckIns.filter((c) => c.date === dateStr);
        let globalStreak = state.profile.globalStreak;
        let bestGlobalStreak = state.profile.bestGlobalStreak;

        if (checkInsToday.length === 1) {
          globalStreak += 1;
          bestGlobalStreak = Math.max(bestGlobalStreak, globalStreak);
        }

        const profileAfterCheckIn: UserProfile = {
          ...updatedProfile,
          globalStreak,
          bestGlobalStreak,
          lastActiveDate: dateStr,
        };

        const updatedHabit: Habit = {
          ...habit,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
        };

        const {
          updatedProfile: finalProfile,
          updatedQuestRewards,
          unlockedQuestRewards,
        } = applyPendingQuestRewardsForStore(
          [updatedHabit],
          updatedCheckIns,
          currentQuestRewards,
          profileAfterCheckIn,
          dateStr
        );

        // Avalia conquistas desbloqueaveis
        const maxStreak = Math.max(
          newBestStreak,
          ...state.habits.map((h) => (h.id === habitId ? newBestStreak : h.bestStreak))
        );

        const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
          state.achievements,
          finalProfile,
          updatedCheckIns.length,
          maxStreak,
          wasInSecondChance
        );

        set({
          profile: finalProfile,
          checkIns: updatedCheckIns,
          questRewards: updatedQuestRewards,
          achievements: updatedAchievements,
          habits: state.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
        });

        const leveledUp = finalProfile.level > state.profile.level;
        return {
          leveledUp,
          unlockedAchievements: newlyUnlocked,
          record: newRecord,
          unlockedQuestRewards,
        };
      },

      uncompleteHabit: (habitId, customDate) => {
        const state = get();
        const dateStr = customDate || getTodayDateString();
        const currentQuestRewards = state.questRewards || [];

        const recordIndex = state.checkIns.findIndex(
          (c) => c.habitId === habitId && c.date === dateStr
        );
        if (recordIndex === -1) {
          return false;
        }

        const record = state.checkIns[recordIndex];
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) {
          return false;
        }

        const { updatedProfile, revertedStreak } = revertHabitCompletion(
          state.profile,
          habit,
          record
        );

        const updatedCheckIns = state.checkIns.filter((_, idx) => idx !== recordIndex);

        // Se nao restou nenhuma meta concluida hoje, reverte incremento de streak global
        const checkInsToday = updatedCheckIns.filter((c) => c.date === dateStr);
        let globalStreak = updatedProfile.globalStreak;
        if (checkInsToday.length === 0 && globalStreak > 0) {
          globalStreak -= 1;
        }

        let workingProfile: UserProfile = {
          ...updatedProfile,
          globalStreak,
        };

        // Avalia estorno de bonus de quest disparados no mesmo dia caso o criterio tenha sido perdido
        const habitCheckInDates = new Set(
          updatedCheckIns.filter((c) => c.habitId === habitId).map((c) => c.date)
        );
        const isBounded = isValidDateString(habit.endDate);
        let scheduledCount = 0;
        let completedInPeriod = 0;
        let minRequiredRate = QUEST_MIN_COMPLETION_RATE;

        if (isBounded && habit.endDate) {
          const effectiveStart = getEffectiveStartDate(habit, dateStr);
          const scheduledDates = getScheduledDatesInRange(habit, effectiveStart, habit.endDate);
          scheduledCount = scheduledDates.length;
          completedInPeriod = scheduledDates.filter((d) => habitCheckInDates.has(d)).length;
          minRequiredRate =
            scheduledCount > 0 && scheduledCount <= SHORT_QUEST_MAX_SCHEDULED_DAYS
              ? 1.0
              : QUEST_MIN_COMPLETION_RATE;
        }

        const remainingQuestRewards: QuestRewardRecord[] = [];
        for (const reward of currentQuestRewards) {
          if (reward.habitId !== habitId || reward.triggerDate !== dateStr) {
            remainingQuestRewards.push(reward);
            continue;
          }

          let shouldRevert = false;
          if (reward.kind === 'continuous_milestone' && reward.milestoneDays) {
            shouldRevert = habitCheckInDates.size < reward.milestoneDays;
          } else if (reward.kind === 'period_perfect' && isBounded) {
            shouldRevert = completedInPeriod < scheduledCount;
          } else if (reward.kind === 'period_completion' && isBounded && habit.endDate) {
            if (dateStr <= habit.endDate) {
              shouldRevert = completedInPeriod < scheduledCount;
            } else {
              const rate = scheduledCount > 0 ? completedInPeriod / scheduledCount : 0;
              shouldRevert = scheduledCount === 0 || rate < minRequiredRate;
            }
          }

          if (shouldRevert) {
            workingProfile = revertQuestReward(workingProfile, reward);
          } else {
            remainingQuestRewards.push(reward);
          }
        }

        const updatedHabit: Habit = {
          ...habit,
          currentStreak: revertedStreak,
        };

        // Caso tenha estornado period_perfect apos a data final mantendo >= 80%, recalcula bonus padrao
        const {
          updatedProfile: finalProfile,
          updatedQuestRewards: finalQuestRewards,
        } = applyPendingQuestRewardsForStore(
          [updatedHabit],
          updatedCheckIns,
          remainingQuestRewards,
          workingProfile,
          dateStr
        );

        set({
          profile: finalProfile,
          checkIns: updatedCheckIns,
          questRewards: finalQuestRewards,
          habits: state.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
        });

        return true;
      },

      evaluateDayChange: (todayStr) => {
        const state = get();
        const today = todayStr || getTodayDateString();
        const currentQuestRewards = state.questRewards || [];

        if (!state.lastEvaluatedDate) {
          const {
            updatedProfile,
            updatedQuestRewards,
            unlockedQuestRewards,
          } = applyPendingQuestRewardsForStore(
            state.habits,
            state.checkIns,
            currentQuestRewards,
            state.profile,
            today
          );

          let updatedAchievements = state.achievements;
          if (unlockedQuestRewards.length > 0) {
            const maxStreak = Math.max(0, ...state.habits.map((h) => h.bestStreak));
            updatedAchievements = evaluateAchievements(
              state.achievements,
              updatedProfile,
              state.checkIns.length,
              maxStreak,
              false
            ).updatedAchievements;
          }

          set({
            profile: updatedProfile,
            questRewards: updatedQuestRewards,
            achievements: updatedAchievements,
            lastEvaluatedDate: today,
          });
          return { hpLost: 0, activatedSecondChance: false, unlockedQuestRewards };
        }

        if (state.lastEvaluatedDate === today) {
          const {
            updatedProfile,
            updatedQuestRewards,
            unlockedQuestRewards,
          } = applyPendingQuestRewardsForStore(
            state.habits,
            state.checkIns,
            currentQuestRewards,
            state.profile,
            today
          );

          if (unlockedQuestRewards.length > 0) {
            const maxStreak = Math.max(0, ...state.habits.map((h) => h.bestStreak));
            const { updatedAchievements } = evaluateAchievements(
              state.achievements,
              updatedProfile,
              state.checkIns.length,
              maxStreak,
              false
            );
            set({
              profile: updatedProfile,
              questRewards: updatedQuestRewards,
              achievements: updatedAchievements,
            });
          }

          return { hpLost: 0, activatedSecondChance: false, unlockedQuestRewards };
        }

        // Calcula dia anterior avaliado
        const prevDate = state.lastEvaluatedDate;
        const [pYear, pMonth, pDay] = prevDate.split('-').map(Number);
        const prevDateObj = new Date(pYear, pMonth - 1, pDay);
        const prevDayOfWeek = prevDateObj.getDay();

        // Encontra habitos que estavam agendados no dia anterior e nao foram cumpridos
        const scheduledYesterday = state.habits.filter((h) => {
          if (h.archived) return false;
          if (h.startDate && h.startDate > prevDate) return false;
          if (h.endDate && h.endDate < prevDate) return false;
          return h.daysOfWeek.length === 0 || h.daysOfWeek.includes(prevDayOfWeek);
        });

        const completedYesterdayHabitIds = new Set(
          state.checkIns.filter((c) => c.date === prevDate).map((c) => c.habitId)
        );

        const missedYesterday = scheduledYesterday.filter(
          (h) => !completedYesterdayHabitIds.has(h.id)
        );

        const { updatedProfile, hpLost, activatedSecondChance } = evaluateMissedHabits(
          state.profile,
          missedYesterday.length
        );

        // Reseta ofensiva atual dos habitos que foram perdidos
        const missedIds = new Set(missedYesterday.map((h) => h.id));
        const updatedHabits = state.habits.map((h) =>
          missedIds.has(h.id) ? { ...h, currentStreak: 0 } : h
        );

        // Se houve metas perdidas no dia anterior, quebra a ofensiva global se nenhuma meta foi feita
        let finalGlobalStreak = updatedProfile.globalStreak;
        if (completedYesterdayHabitIds.size === 0 && scheduledYesterday.length > 0) {
          finalGlobalStreak = 0;
        }

        const profileAfterMissed: UserProfile = {
          ...updatedProfile,
          globalStreak: finalGlobalStreak,
        };

        const {
          updatedProfile: finalProfile,
          updatedQuestRewards,
          unlockedQuestRewards,
        } = applyPendingQuestRewardsForStore(
          updatedHabits,
          state.checkIns,
          currentQuestRewards,
          profileAfterMissed,
          today
        );

        let updatedAchievements = state.achievements;
        if (unlockedQuestRewards.length > 0) {
          const maxStreak = Math.max(0, ...updatedHabits.map((h) => h.bestStreak));
          updatedAchievements = evaluateAchievements(
            state.achievements,
            finalProfile,
            state.checkIns.length,
            maxStreak,
            false
          ).updatedAchievements;
        }

        set({
          profile: finalProfile,
          questRewards: updatedQuestRewards,
          achievements: updatedAchievements,
          habits: updatedHabits,
          lastEvaluatedDate: today,
        });

        return { hpLost, activatedSecondChance, unlockedQuestRewards };
      },

      getHabitsForDate: (dateStr) => {
        const state = get();
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();

        return state.habits.filter((h) => {
          if (h.archived) return false;

          // Valida periodo de vigencia no calendario (startDate e endDate)
          if (h.startDate && h.startDate > dateStr) return false;
          if (h.endDate && h.endDate < dateStr) return false;

          // Valida dias da semana
          return h.daysOfWeek.length === 0 || h.daysOfWeek.includes(dayOfWeek);
        });
      },

      isHabitCompletedOnDate: (habitId, dateStr) => {
        const state = get();
        return state.checkIns.some((c) => c.habitId === habitId && c.date === dateStr);
      },

      evolveOrSwitchClass: (classId) => {
        const state = get();
        const result = domainEvolveOrSwitchClass(classId, state.profile);
        if (result.success) {
          set({ profile: result.updatedProfile });
        }
        return { success: result.success, error: result.error };
      },

      updateProfileAfterBattle: (expeditionSpent, xpAwarded, goldAwarded) => {
        const state = get();
        const currentExpedition = state.profile.expeditionPoints || 0;
        const newExpedition = Math.max(0, currentExpedition - expeditionSpent);
        const newGold = (state.profile.goldBalance || 0) + goldAwarded;

        let newLevel = state.profile.level;
        let newXP = state.profile.currentXP;
        let leveledUp = false;

        if (xpAwarded > 0) {
          const xpResult = applyXpGain(newLevel, newXP, xpAwarded);
          newLevel = xpResult.level;
          newXP = xpResult.currentXP;
          leveledUp = xpResult.leveledUp;
        }

        set({
          profile: {
            ...state.profile,
            level: newLevel,
            currentXP: newXP,
            expeditionPoints: newExpedition,
            goldBalance: newGold,
          },
        });

        return { leveledUp };
      },

      ensureProfileDefaults: () => {
        const state = get();
        const p = state.profile;
        const needsProfileDefaults =
          !p.currentClass ||
          !p.unlockedClasses ||
          p.expeditionPoints === undefined ||
          p.goldBalance === undefined;
        const needsQuestRewards = !Array.isArray(state.questRewards);

        if (needsProfileDefaults || needsQuestRewards) {
          set({
            profile: needsProfileDefaults
              ? {
                  ...p,
                  currentClass: p.currentClass || 'aprendiz',
                  unlockedClasses: p.unlockedClasses || ['aprendiz'],
                  expeditionPoints: p.expeditionPoints || 0,
                  goldBalance: p.goldBalance || 0,
                }
              : p,
            questRewards: needsQuestRewards ? [] : state.questRewards,
          });
        }
      },

      resetStore: () => {
        set({
          habits: [],
          checkIns: [],
          questRewards: [],
          profile: createInitialProfile(),
          achievements: INITIAL_ACHIEVEMENTS,
          lastEvaluatedDate: null,
        });
      },
    }),
    {
      name: 'habitquest-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        habits: state.habits,
        checkIns: state.checkIns,
        questRewards: state.questRewards,
        profile: state.profile,
        achievements: state.achievements,
        lastEvaluatedDate: state.lastEvaluatedDate,
      }),
    }
  )
);
