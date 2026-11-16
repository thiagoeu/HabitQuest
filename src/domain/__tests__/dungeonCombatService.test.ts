import {
  DUNGEONS_CATALOG,
  getAllDungeons,
  getDungeonById,
  getMonsterById,
  calculatePlayerCombatPower,
  calculateWinProbability,
  simulateBattle,
} from '../dungeonCombatService';
import { createInitialProfile } from '../gamificationEngine';
import { UserProfile, Monster } from '../../types';

describe('DungeonCombatService', () => {
  let profile: UserProfile;

  beforeEach(() => {
    profile = {
      ...createInitialProfile(),
      level: 5,
      expeditionPoints: 50,
      goldBalance: 100,
    };
  });

  test('catalogo de masmorras contem as 3 cavernas escalonadas', () => {
    const dungeons = getAllDungeons();
    expect(dungeons).toHaveLength(3);
    expect(dungeons[0].monsters.length).toBeGreaterThan(0);
    expect(getDungeonById('dungeon-ecos')).toBeDefined();
    expect(getMonsterById('monster-goblin-preguica')).toBeDefined();
  });

  test('calculo de probabilidade respeita os limites estritos (clamp entre 5% e 95%)', () => {
    // Jogador fraco contra chefe fortissimo nao zera a chance (piso 5%)
    const lowProb = calculateWinProbability(10, 500);
    expect(lowProb).toBe(5);

    // Jogador forte contra monstro fraco nao atinge 100% (teto 95%)
    const highProb = calculateWinProbability(500, 10);
    expect(highProb).toBe(95);

    // Poderes iguais geram 50%
    const balancedProb = calculateWinProbability(100, 100);
    expect(balancedProb).toBe(50);
  });

  test('calculo de poder de combate inclui nivel, atributos e classe ativa', () => {
    const powerApprentice = calculatePlayerCombatPower(profile);
    expect(powerApprentice).toBeGreaterThan(0);

    const knightProfile: UserProfile = {
      ...profile,
      currentClass: 'cavaleiro',
    };
    const powerKnight = calculatePlayerCombatPower(knightProfile);
    // Cavaleiro tem bonus de combate de +20
    expect(powerKnight).toBe(powerApprentice + 20);
  });

  test('exorcista recebe bonus especial contra monstros de trevas', () => {
    const darkMonster: Monster = {
      id: 'm-trevas',
      name: 'Monstro das Trevas',
      title: 'Sombra',
      lore: 'Escuridao',
      level: 5,
      difficulty: 'dificil',
      power: 80,
      expeditionCost: 20,
      rewards: { xp: 50, gold: 40 },
      iconName: 'skull',
      elementalAffinity: 'trevas',
    };

    const regularMonster: Monster = {
      ...darkMonster,
      elementalAffinity: undefined,
    };

    const exorcistProfile: UserProfile = {
      ...profile,
      currentClass: 'exorcista',
    };

    const powerAgainstDark = calculatePlayerCombatPower(exorcistProfile, darkMonster);
    const powerAgainstRegular = calculatePlayerCombatPower(exorcistProfile, regularMonster);

    expect(powerAgainstDark).toBe(powerAgainstRegular + 20);
  });

  test('impede batalha quando pontos de expedicao sao insuficientes', () => {
    const lowEnergyProfile: UserProfile = {
      ...profile,
      expeditionPoints: 5,
    };
    const monster = getMonsterById('monster-goblin-preguica')!;

    const result = simulateBattle(lowEnergyProfile, monster, 'dungeon-ecos');
    expect(result.canFight).toBe(false);
    expect(result.reason).toContain('Pontos de expedicao insuficientes');
  });

  test('vitoria em combate concede XP e ouro e deduz pontos de expedicao', () => {
    const monster = getMonsterById('monster-goblin-preguica')!;
    const result = simulateBattle(profile, monster, 'dungeon-ecos', {
      forcedRoll: 1, // Garante vitoria
      customDate: '2026-11-16',
    });

    expect(result.canFight).toBe(true);
    expect(result.battleResult?.victory).toBe(true);
    expect(result.battleResult?.xpAwarded).toBe(monster.rewards.xp);
    expect(result.battleResult?.goldAwarded).toBe(monster.rewards.gold);
    expect(result.updatedProfile?.expeditionPoints).toBe(50 - monster.expeditionCost);
    expect(result.updatedProfile?.goldBalance).toBe(100 + monster.rewards.gold);
  });

  test('derrota em combate consome energia sem penalizar ouro ou atributos', () => {
    const monster = getMonsterById('monster-goblin-preguica')!;
    const result = simulateBattle(profile, monster, 'dungeon-ecos', {
      forcedRoll: 100, // Garante derrota (roll > 95)
      customDate: '2026-11-16',
    });

    expect(result.canFight).toBe(true);
    expect(result.battleResult?.victory).toBe(false);
    expect(result.battleResult?.xpAwarded).toBe(0);
    expect(result.battleResult?.goldAwarded).toBe(0);
    expect(result.updatedProfile?.expeditionPoints).toBe(50 - monster.expeditionCost);
    expect(result.updatedProfile?.goldBalance).toBe(100);
    expect(result.battleResult?.combatLog.length).toBeGreaterThan(0);
  });
});
