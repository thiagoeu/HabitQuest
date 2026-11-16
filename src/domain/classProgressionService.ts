import { AttributeCategory, CharacterClass, CharacterClassId, UserProfile } from '../types';

export const CLASSES_CATALOG: Record<CharacterClassId, CharacterClass> = {
  aprendiz: {
    id: 'aprendiz',
    name: 'Aprendiz',
    title: 'Iniciado nos Habitos',
    description: 'Comecando sua jornada em busca de autodomínio e forja de rotinas.',
    lore: 'Todo heroi comeca com pequenos passos e a decisao de cumprir seus compromissos diarios.',
    requiredLevel: 1,
    requiredAttributes: {},
    perk: {
      description: 'Equilibrio inicial sem afinidades adicionais.',
    },
    iconName: 'school-outline',
    themeColor: '#94A3B8',
  },
  monge: {
    id: 'monge',
    name: 'Monge',
    title: 'Mestre da Serenidade e Foco',
    description: 'Especialista em autocontrole, meditacao e perseveranca inabalavel.',
    lore: 'Treinado para manter a serenidade mesmo sob pressao extrema da procrastinacao.',
    requiredLevel: 5,
    requiredAttributes: {
      disciplina: 20,
    },
    perk: {
      description: '+25% de ganho no atributo Disciplina e +15 de poder em combate.',
      attributeMultiplier: {
        disciplina: 1.25,
      },
      combatPowerBonus: 15,
    },
    iconName: 'body-outline',
    themeColor: '#F59E0B',
  },
  cavaleiro: {
    id: 'cavaleiro',
    name: 'Cavaleiro',
    title: 'Bastião da Forca e Coragem',
    description: 'Focado em superar desafios fisicos e construir resistencia inquebravel.',
    lore: 'Sua armadura e forjada na consistencia dos exercicios e esforco diario.',
    requiredLevel: 5,
    requiredAttributes: {
      forca: 20,
    },
    perk: {
      description: '+25% de ganho no atributo Forca e +20 de poder de ataque.',
      attributeMultiplier: {
        forca: 1.25,
      },
      combatPowerBonus: 20,
    },
    iconName: 'shield-outline',
    themeColor: '#EF4444',
  },
  sabio: {
    id: 'sabio',
    name: 'Sabio',
    title: 'Guardiao do Conhecimento',
    description: 'Dedicado aos estudos profundos, leitura, foco intelectual e sabedoria.',
    lore: 'Desvenda os segredos da mente atraves da leitura e do aprendizado constante.',
    requiredLevel: 5,
    requiredAttributes: {
      intelecto: 20,
    },
    perk: {
      description: '+25% de ganho no atributo Intelecto e +15% de XP extra em vitorias.',
      attributeMultiplier: {
        intelecto: 1.25,
      },
      xpBonusMultiplier: 1.15,
      combatPowerBonus: 10,
    },
    iconName: 'book-outline',
    themeColor: '#3B82F6',
  },
  arqueiro: {
    id: 'arqueiro',
    name: 'Arqueiro',
    title: 'Cacador Preciso',
    description: 'Mestre da pontaria e da execucao disciplinada no momento exato.',
    lore: 'Nunca erra o alvo quando tem disciplina e preparo constante.',
    requiredLevel: 5,
    requiredAttributes: {
      disciplina: 15,
      forca: 10,
    },
    perk: {
      description: '+15% no ganho de Disciplina e +15% de chance de acerto critico em masmorras.',
      attributeMultiplier: {
        disciplina: 1.15,
      },
      critChanceBonus: 0.15,
      combatPowerBonus: 12,
    },
    iconName: 'locate-outline',
    themeColor: '#10B981',
  },
  exorcista: {
    id: 'exorcista',
    name: 'Exorcista',
    title: 'Banidor de Sombras',
    description: 'Combina vigor e intelecto para banir a apatia, a duvida e o desanimo.',
    lore: 'Purifica as cavernas mais profundas do desanimo com a luz da disciplina.',
    requiredLevel: 5,
    requiredAttributes: {
      intelecto: 15,
      forca: 15,
    },
    perk: {
      description: '+15% de ganho em Forca e Intelecto, e +25 de poder contra monstros sombrios.',
      attributeMultiplier: {
        forca: 1.15,
        intelecto: 1.15,
      },
      combatPowerBonus: 25,
    },
    iconName: 'flame-outline',
    themeColor: '#8B5CF6',
  },
};

export function getClassDetails(classId: CharacterClassId): CharacterClass {
  return CLASSES_CATALOG[classId] || CLASSES_CATALOG.aprendiz;
}

export function getAllClasses(): CharacterClass[] {
  return Object.values(CLASSES_CATALOG);
}

export function checkClassRequirements(
  classId: CharacterClassId,
  profile: UserProfile
): { eligible: boolean; reasons: string[] } {
  const targetClass = getClassDetails(classId);
  const reasons: string[] = [];

  if (profile.level < targetClass.requiredLevel) {
    reasons.push(`Nivel ${targetClass.requiredLevel} requerido (Nivel atual: ${profile.level})`);
  }

  for (const [attr, minPoints] of Object.entries(targetClass.requiredAttributes)) {
    const category = attr as AttributeCategory;
    const currentPoints = profile.attributes[category]?.points || 0;
    if (currentPoints < (minPoints || 0)) {
      reasons.push(
        `${minPoints} pontos de ${category.toUpperCase()} necessarios (Atual: ${currentPoints})`
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function canEvolveToClass(classId: CharacterClassId, profile: UserProfile): boolean {
  return checkClassRequirements(classId, profile).eligible;
}

export function evolveOrSwitchClass(
  classId: CharacterClassId,
  profile: UserProfile
): { success: boolean; updatedProfile: UserProfile; error?: string } {
  const isAlreadyUnlocked = profile.unlockedClasses?.includes(classId);

  if (!isAlreadyUnlocked) {
    const { eligible, reasons } = checkClassRequirements(classId, profile);
    if (!eligible) {
      return {
        success: false,
        updatedProfile: profile,
        error: reasons.join('. '),
      };
    }
  }

  const currentUnlocked = profile.unlockedClasses || ['aprendiz'];
  const newUnlocked = currentUnlocked.includes(classId)
    ? currentUnlocked
    : [...currentUnlocked, classId];

  const updatedProfile: UserProfile = {
    ...profile,
    currentClass: classId,
    unlockedClasses: newUnlocked,
  };

  return {
    success: true,
    updatedProfile,
  };
}

export function getClassAttributeMultiplier(
  classId: CharacterClassId,
  category: AttributeCategory
): number {
  const currentClass = getClassDetails(classId);
  return currentClass.perk.attributeMultiplier?.[category] || 1.0;
}
