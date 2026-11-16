import {
  BattleResult,
  BattleTurn,
  CharacterClassId,
  Dungeon,
  Monster,
  UserProfile,
} from '../types';
import { getClassDetails } from './classProgressionService';

export const DUNGEONS_CATALOG: Dungeon[] = [
  {
    id: 'dungeon-ecos',
    name: 'Caverna dos Ecos da Procrastinacao',
    description: 'Um labirinto sombrio onde sussurros de desculpas tentam paralisar os herois.',
    minLevel: 1,
    themeColor: '#0EA5E9',
    monsters: [
      {
        id: 'monster-goblin-preguica',
        name: 'Goblin da Preguica',
        title: 'Ladrão de Minutos',
        lore: 'Alimenta-se de tarefas deixadas para depois.',
        level: 1,
        difficulty: 'facil',
        power: 20,
        expeditionCost: 10,
        rewards: {
          xp: 25,
          gold: 15,
        },
        iconName: 'bug-outline',
      },
      {
        id: 'monster-espectro-distracao',
        name: 'Espectro da Distracao',
        title: 'Sombra das Notificacoes',
        lore: 'Aparece a todo momento para desviar a atencao do que realmente importa.',
        level: 3,
        difficulty: 'medio',
        power: 50,
        expeditionCost: 15,
        rewards: {
          xp: 50,
          gold: 35,
        },
        iconName: 'skull-outline',
      },
    ],
  },
  {
    id: 'dungeon-cripta-duvidas',
    name: 'Cripta das Duvidas e Insegurancas',
    description: 'Camaras antigas onde habitam os monstros que questionam sua capacidade.',
    minLevel: 5,
    themeColor: '#8B5CF6',
    monsters: [
      {
        id: 'monster-golem-cansaco',
        name: 'Golem do Cansaco',
        title: 'Peso da Inercia',
        lore: 'Um monstro de pedra macica que tenta fazer voce desistir antes de tentar.',
        level: 5,
        difficulty: 'medio',
        power: 80,
        expeditionCost: 20,
        rewards: {
          xp: 80,
          gold: 60,
        },
        iconName: 'fitness-outline',
      },
      {
        id: 'monster-besta-desanimo',
        name: 'Besta do Desanimo',
        title: 'Devorador de Motivacao',
        lore: 'Ataca quando a rotina fica dificil, mas recua diante da disciplina inabalavel.',
        level: 7,
        difficulty: 'dificil',
        power: 110,
        expeditionCost: 25,
        rewards: {
          xp: 130,
          gold: 100,
        },
        iconName: 'flame-outline',
        elementalAffinity: 'trevas',
      },
    ],
  },
  {
    id: 'dungeon-abismo-bloqueio',
    name: 'Abismo do Bloqueio Mental',
    description: 'A caverna mais profunda onde reside a raiz de toda a procrastinacao.',
    minLevel: 10,
    themeColor: '#EF4444',
    monsters: [
      {
        id: 'monster-lorde-procrastinador',
        name: 'Lorde da Procrastinacao',
        title: 'Senhor do Deixar Para Amanha',
        lore: 'O lider supremo das forcas da estagnacao. Apenas habitos de aco podem vence-lo.',
        level: 10,
        difficulty: 'chefe',
        power: 160,
        expeditionCost: 35,
        rewards: {
          xp: 250,
          gold: 220,
        },
        iconName: 'trophy-outline',
        elementalAffinity: 'trevas',
      },
    ],
  },
];

export function getAllDungeons(): Dungeon[] {
  return DUNGEONS_CATALOG;
}

export function getDungeonById(dungeonId: string): Dungeon | undefined {
  return DUNGEONS_CATALOG.find((d) => d.id === dungeonId);
}

export function getMonsterById(monsterId: string): Monster | undefined {
  for (const dungeon of DUNGEONS_CATALOG) {
    const found = dungeon.monsters.find((m) => m.id === monsterId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Calcula o poder de combate do jogador com base em nivel, atributos e classe ativa
 */
export function calculatePlayerCombatPower(
  profile: UserProfile,
  targetMonster?: Monster
): number {
  const baseLevelPower = profile.level * 10;

  const attrPower =
    (profile.attributes.forca.level +
      profile.attributes.disciplina.level +
      profile.attributes.intelecto.level) *
    5;

  const currentClass = getClassDetails(profile.currentClass);
  let classCombatBonus = currentClass.perk.combatPowerBonus || 0;

  // Bônus especial do Exorcista contra monstros das trevas/chefes
  if (
    profile.currentClass === 'exorcista' &&
    (targetMonster?.elementalAffinity === 'trevas' || targetMonster?.difficulty === 'chefe')
  ) {
    classCombatBonus += 20;
  }

  return baseLevelPower + attrPower + classCombatBonus;
}

/**
 * Calcula a probabilidade de vitoria em porcentagem com piso de 5% e teto de 95%
 */
export function calculateWinProbability(
  playerPower: number,
  monsterPower: number,
  critChanceBonus: number = 0
): number {
  const baseDiff = (playerPower - monsterPower) / 2;
  const critImpact = critChanceBonus * 100;
  const rawProb = Math.round(50 + baseDiff + critImpact);

  return Math.min(95, Math.max(5, rawProb));
}

/**
 * Simula uma batalha gerando log dinamico e recompensas
 */
export function simulateBattle(
  profile: UserProfile,
  monster: Monster,
  dungeonId: string,
  options?: {
    forcedRoll?: number;
    customDate?: string;
  }
): {
  canFight: boolean;
  reason?: string;
  battleResult?: BattleResult;
  updatedProfile?: UserProfile;
} {
  if (profile.expeditionPoints < monster.expeditionCost) {
    return {
      canFight: false,
      reason: `Pontos de expedicao insuficientes (${profile.expeditionPoints}/${monster.expeditionCost})`,
    };
  }

  const currentClass = getClassDetails(profile.currentClass);
  const playerPower = calculatePlayerCombatPower(profile, monster);
  const winProbability = calculateWinProbability(
    playerPower,
    monster.power,
    currentClass.perk.critChanceBonus || 0
  );

  const roll = options?.forcedRoll ?? Math.floor(Math.random() * 100) + 1;
  const victory = roll <= winProbability;

  const dateStr = options?.customDate || new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // Log narrativo dos turnos
  const combatLog: BattleTurn[] = [];

  combatLog.push({
    turnNumber: 1,
    actor: 'player',
    actionDescription: `${currentClass.name} avanca bravamente contra ${monster.name}!`,
  });

  if (victory) {
    combatLog.push({
      turnNumber: 2,
      actor: 'monster',
      actionDescription: `${monster.name} tenta atacar com forca ${monster.power}, mas e repelido pela consistencia do heroi.`,
    });
    combatLog.push({
      turnNumber: 3,
      actor: 'player',
      actionDescription: `Golpe decisivo executado com poder ${playerPower}! ${monster.name} foi derrotado!`,
      isCrit: roll <= (currentClass.perk.critChanceBonus || 0) * 100 + 10,
    });
  } else {
    combatLog.push({
      turnNumber: 2,
      actor: 'monster',
      actionDescription: `${monster.name} desfere um contra-ataque poderoso e resiste aos seus golpes.`,
    });
    combatLog.push({
      turnNumber: 3,
      actor: 'player',
      actionDescription: `Voce precisou recuar estrategicamente para recuperar o foco e treinar mais habitos.`,
    });
  }

  // Calculo de recompensas
  let xpAwarded = 0;
  let goldAwarded = 0;

  if (victory) {
    const xpMultiplier = currentClass.perk.xpBonusMultiplier || 1.0;
    xpAwarded = Math.round(monster.rewards.xp * xpMultiplier);
    goldAwarded = monster.rewards.gold;
  }

  const expeditionPointsSpent = monster.expeditionCost;

  // Atualizacao de perfil (consome expedicao e concede ouro e XP em caso de vitoria)
  const newExpeditionPoints = Math.max(0, profile.expeditionPoints - expeditionPointsSpent);
  const newGoldBalance = profile.goldBalance + goldAwarded;

  const updatedProfile: UserProfile = {
    ...profile,
    expeditionPoints: newExpeditionPoints,
    goldBalance: newGoldBalance,
  };

  const battleResult: BattleResult = {
    id: `battle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dungeonId,
    monster,
    victory,
    winProbability,
    roll,
    xpAwarded,
    goldAwarded,
    expeditionPointsSpent,
    combatLog,
    date: dateStr,
    timestamp,
  };

  return {
    canFight: true,
    battleResult,
    updatedProfile,
  };
}
