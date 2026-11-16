import { AttributeCategory } from './index';

export type CharacterClassId =
  | 'aprendiz'
  | 'monge'
  | 'cavaleiro'
  | 'sabio'
  | 'arqueiro'
  | 'exorcista';

export interface ClassPerk {
  description: string;
  attributeMultiplier?: Partial<Record<AttributeCategory, number>>;
  combatPowerBonus?: number;
  xpBonusMultiplier?: number;
  critChanceBonus?: number;
}

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  title: string;
  description: string;
  lore: string;
  requiredLevel: number;
  requiredAttributes: Partial<Record<AttributeCategory, number>>;
  perk: ClassPerk;
  iconName: string;
  themeColor: string;
}

export type DungeonDifficulty = 'facil' | 'medio' | 'dificil' | 'chefe';

export interface Monster {
  id: string;
  name: string;
  title: string;
  lore: string;
  level: number;
  difficulty: DungeonDifficulty;
  power: number;
  expeditionCost: number;
  rewards: {
    xp: number;
    gold: number;
  };
  iconName: string;
  elementalAffinity?: 'trevas' | 'caos' | 'fogo' | 'espectral';
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  monsters: Monster[];
  themeColor: string;
}

export interface BattleTurn {
  turnNumber: number;
  actor: 'player' | 'monster';
  actionDescription: string;
  isCrit?: boolean;
}

export interface BattleResult {
  id: string;
  dungeonId: string;
  monster: Monster;
  victory: boolean;
  winProbability: number;
  roll: number;
  xpAwarded: number;
  goldAwarded: number;
  expeditionPointsSpent: number;
  combatLog: BattleTurn[];
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
}
