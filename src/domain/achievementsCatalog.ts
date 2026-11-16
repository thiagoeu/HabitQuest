import { Achievement, UserProfile } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Primeiro Passo',
    description: 'Complete sua primeira meta diária.',
    category: 'consistency',
    unlocked: false,
    unlockedAt: null,
    iconName: 'flag-outline',
    requirementText: '1 meta concluída',
  },
  {
    id: 'streak_3',
    title: 'Consistência Inicial',
    description: 'Alcance uma ofensiva de 3 dias seguidos.',
    category: 'consistency',
    unlocked: false,
    unlockedAt: null,
    iconName: 'flame-outline',
    requirementText: 'Sequência de 3 dias',
  },
  {
    id: 'streak_7',
    title: 'Semana Imparável',
    description: 'Mantenha 7 dias consecutivos de ofensiva.',
    category: 'consistency',
    unlocked: false,
    unlockedAt: null,
    iconName: 'shield-checkmark-outline',
    requirementText: 'Sequência de 7 dias',
  },
  {
    id: 'streak_30',
    title: 'Hábito de Ferro',
    description: 'Conquiste a marca lendária de 30 dias de ofensiva.',
    category: 'consistency',
    unlocked: false,
    unlockedAt: null,
    iconName: 'trophy-outline',
    requirementText: 'Sequência de 30 dias',
  },
  {
    id: 'intellect_2',
    title: 'Mente Afiada',
    description: 'Evolua o atributo Intelecto para o nível 2.',
    category: 'attribute',
    unlocked: false,
    unlockedAt: null,
    iconName: 'book-outline',
    requirementText: 'Nível 2 em Intelecto',
  },
  {
    id: 'strength_2',
    title: 'Corpo Blindado',
    description: 'Evolua o atributo Força/Saúde para o nível 2.',
    category: 'attribute',
    unlocked: false,
    unlockedAt: null,
    iconName: 'barbell-outline',
    requirementText: 'Nível 2 em Força',
  },
  {
    id: 'discipline_2',
    title: 'Foco Inabalável',
    description: 'Evolua o atributo Disciplina para o nível 2.',
    category: 'attribute',
    unlocked: false,
    unlockedAt: null,
    iconName: 'compass-outline',
    requirementText: 'Nível 2 em Disciplina',
  },
  {
    id: 'level_5',
    title: 'Guerreiro Veterano',
    description: 'Alcance o nível global 5 no aplicativo.',
    category: 'level',
    unlocked: false,
    unlockedAt: null,
    iconName: 'star-outline',
    requirementText: 'Nível global 5',
  },
  {
    id: 'phoenix',
    title: 'Fênix da Retomada',
    description: 'Recupere sua energia cumprindo uma meta em Segunda Chance.',
    category: 'special',
    unlocked: false,
    unlockedAt: null,
    iconName: 'flash-outline',
    requirementText: 'Superar o modo Segunda Chance',
  },
];

/**
 * Avalia a lista de conquistas e desbloqueia as que atingiram os requisitos
 */
export function evaluateAchievements(
  currentAchievements: Achievement[],
  profile: UserProfile,
  totalCompletedCheckIns: number,
  maxStreak: number,
  completedInSecondChance: boolean = false
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const now = new Date().toISOString();
  const newlyUnlocked: Achievement[] = [];

  const updatedAchievements = currentAchievements.map((item) => {
    if (item.unlocked) {
      return item;
    }

    let shouldUnlock = false;

    switch (item.id) {
      case 'first_step':
        shouldUnlock = totalCompletedCheckIns >= 1;
        break;
      case 'streak_3':
        shouldUnlock = maxStreak >= 3 || profile.globalStreak >= 3;
        break;
      case 'streak_7':
        shouldUnlock = maxStreak >= 7 || profile.globalStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = maxStreak >= 30 || profile.globalStreak >= 30;
        break;
      case 'intellect_2':
        shouldUnlock = (profile.attributes.intelecto?.level || 1) >= 2;
        break;
      case 'strength_2':
        shouldUnlock = (profile.attributes.forca?.level || 1) >= 2;
        break;
      case 'discipline_2':
        shouldUnlock = (profile.attributes.disciplina?.level || 1) >= 2;
        break;
      case 'level_5':
        shouldUnlock = profile.level >= 5;
        break;
      case 'phoenix':
        shouldUnlock = completedInSecondChance;
        break;
    }

    if (shouldUnlock) {
      const unlockedItem = {
        ...item,
        unlocked: true,
        unlockedAt: now,
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    return item;
  });

  return { updatedAchievements, newlyUnlocked };
}
