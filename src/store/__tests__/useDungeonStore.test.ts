import { useDungeonStore } from '../useDungeonStore';
import { BattleResult, Monster } from '../../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('useDungeonStore', () => {
  const dummyMonster: Monster = {
    id: 'm-teste',
    name: 'Goblin de Teste',
    title: 'Fraco',
    lore: 'Teste',
    level: 1,
    difficulty: 'facil',
    power: 20,
    expeditionCost: 10,
    rewards: { xp: 15, gold: 10 },
    iconName: 'bug',
  };

  beforeEach(() => {
    useDungeonStore.getState().clearDungeonHistory();
  });

  test('inicia com historico vazio e masmorra padrao selecionada', () => {
    const state = useDungeonStore.getState();
    expect(state.battleHistory).toEqual([]);
    expect(state.defeatedMonsterIds).toEqual([]);
    expect(state.selectedDungeonId).toBe('dungeon-ecos');
    expect(state.getDefeatedCount()).toBe(0);
    expect(state.getBattlesWonCount()).toBe(0);
  });

  test('registra batalha com vitoria e adiciona o monstro a lista de derrotados', () => {
    const battle: BattleResult = {
      id: 'b-1',
      dungeonId: 'dungeon-ecos',
      monster: dummyMonster,
      victory: true,
      winProbability: 70,
      roll: 20,
      xpAwarded: 15,
      goldAwarded: 10,
      expeditionPointsSpent: 10,
      combatLog: [],
      date: '2026-11-16',
      timestamp: '2026-11-16T12:00:00Z',
    };

    useDungeonStore.getState().recordBattle(battle);

    const state = useDungeonStore.getState();
    expect(state.battleHistory).toHaveLength(1);
    expect(state.defeatedMonsterIds).toContain('m-teste');
    expect(state.getDefeatedCount()).toBe(1);
    expect(state.getBattlesWonCount()).toBe(1);
    expect(state.currentBattle?.id).toBe('b-1');
  });

  test('registra batalha com derrota sem adicionar aos monstros derrotados', () => {
    const battleDefeat: BattleResult = {
      id: 'b-2',
      dungeonId: 'dungeon-ecos',
      monster: { ...dummyMonster, id: 'm-forte' },
      victory: false,
      winProbability: 20,
      roll: 90,
      xpAwarded: 0,
      goldAwarded: 0,
      expeditionPointsSpent: 10,
      combatLog: [],
      date: '2026-11-16',
      timestamp: '2026-11-16T12:00:00Z',
    };

    useDungeonStore.getState().recordBattle(battleDefeat);

    const state = useDungeonStore.getState();
    expect(state.battleHistory).toHaveLength(1);
    expect(state.defeatedMonsterIds).not.toContain('m-forte');
    expect(state.getBattlesWonCount()).toBe(0);
  });
});
