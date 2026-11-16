import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BattleResult } from '../types';

export interface DungeonState {
  battleHistory: BattleResult[];
  defeatedMonsterIds: string[];
  selectedDungeonId: string | null;
  currentBattle: BattleResult | null;

  // Actions
  recordBattle: (result: BattleResult) => void;
  setSelectedDungeon: (dungeonId: string | null) => void;
  setCurrentBattle: (result: BattleResult | null) => void;
  clearDungeonHistory: () => void;
  getDefeatedCount: () => number;
  getBattlesWonCount: () => number;
}

export const useDungeonStore = create<DungeonState>()(
  persist(
    (set, get) => ({
      battleHistory: [],
      defeatedMonsterIds: [],
      selectedDungeonId: 'dungeon-ecos',
      currentBattle: null,

      recordBattle: (result: BattleResult) => {
        set((state) => {
          const updatedHistory = [result, ...state.battleHistory];
          let updatedDefeated = state.defeatedMonsterIds;

          if (result.victory && !state.defeatedMonsterIds.includes(result.monster.id)) {
            updatedDefeated = [...state.defeatedMonsterIds, result.monster.id];
          }

          return {
            battleHistory: updatedHistory,
            defeatedMonsterIds: updatedDefeated,
            currentBattle: result,
          };
        });
      },

      setSelectedDungeon: (dungeonId) => {
        set({ selectedDungeonId: dungeonId });
      },

      setCurrentBattle: (result) => {
        set({ currentBattle: result });
      },

      clearDungeonHistory: () => {
        set({
          battleHistory: [],
          defeatedMonsterIds: [],
          currentBattle: null,
        });
      },

      getDefeatedCount: () => {
        return get().defeatedMonsterIds.length;
      },

      getBattlesWonCount: () => {
        return get().battleHistory.filter((b) => b.victory).length;
      },
    }),
    {
      name: '@habitquest:dungeons',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        battleHistory: state.battleHistory,
        defeatedMonsterIds: state.defeatedMonsterIds,
        selectedDungeonId: state.selectedDungeonId,
      }),
    }
  )
);
