import { INITIAL_ACHIEVEMENTS, evaluateAchievements } from '../achievementsCatalog';
import { getSelfEfficacyMessage, getRandomMotivationalQuote, STATIC_MOTIVATIONAL_QUOTES } from '../motivationalQuotes';
import { createInitialProfile } from '../gamificationEngine';

describe('achievementsCatalog', () => {
  test('desbloqueia conquista do primeiro passo ao completar 1 meta', () => {
    const profile = createInitialProfile();
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
      INITIAL_ACHIEVEMENTS,
      profile,
      1,
      1
    );

    const firstStep = updatedAchievements.find((a) => a.id === 'first_step');
    expect(firstStep?.unlocked).toBe(true);
    expect(newlyUnlocked.some((a) => a.id === 'first_step')).toBe(true);
  });

  test('desbloqueia conquista de streak 3 e 7 dias', () => {
    const profile = {
      ...createInitialProfile(),
      globalStreak: 7,
    };

    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
      INITIAL_ACHIEVEMENTS,
      profile,
      7,
      7
    );

    const streak3 = updatedAchievements.find((a) => a.id === 'streak_3');
    const streak7 = updatedAchievements.find((a) => a.id === 'streak_7');
    expect(streak3?.unlocked).toBe(true);
    expect(streak7?.unlocked).toBe(true);
    expect(newlyUnlocked.length).toBeGreaterThanOrEqual(3); // first_step, streak_3, streak_7
  });

  test('desbloqueia conquista de atributo ao atingir nivel 2', () => {
    const profile = {
      ...createInitialProfile(),
      attributes: {
        intelecto: { points: 150, level: 2 },
        forca: { points: 0, level: 1 },
        disciplina: { points: 0, level: 1 },
      },
    };

    const { updatedAchievements } = evaluateAchievements(
      INITIAL_ACHIEVEMENTS,
      profile,
      5,
      1
    );

    const intellect2 = updatedAchievements.find((a) => a.id === 'intellect_2');
    expect(intellect2?.unlocked).toBe(true);
  });

  test('desbloqueia fenix ao concluir meta em modo segunda chance', () => {
    const profile = createInitialProfile();
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
      INITIAL_ACHIEVEMENTS,
      profile,
      1,
      1,
      true // completedInSecondChance
    );

    const phoenix = updatedAchievements.find((a) => a.id === 'phoenix');
    expect(phoenix?.unlocked).toBe(true);
    expect(newlyUnlocked.some((a) => a.id === 'phoenix')).toBe(true);
  });
});

describe('motivationalQuotes', () => {
  test('retorna frase aleatoria da lista estatica', () => {
    const quote = getRandomMotivationalQuote();
    expect(STATIC_MOTIVATIONAL_QUOTES).toContain(quote);
  });

  test('gera mensagens de autoeficacia de acordo com contexto do usuario', () => {
    const profile = createInitialProfile();

    // Novo usuario sem metas
    expect(getSelfEfficacyMessage(profile, 0, 2)).toContain('primeiro passo');

    // Em segunda chance
    const secondChanceProfile = { ...profile, inSecondChance: true };
    expect(getSelfEfficacyMessage(secondChanceProfile, 5, 2)).toContain('Momento de virada');

    // Todas as metas batidas hoje
    expect(getSelfEfficacyMessage(profile, 10, 0)).toContain('Missão cumprida por hoje');

    // Sequencia forte de 7 dias
    const streakProfile = { ...profile, globalStreak: 7 };
    expect(getSelfEfficacyMessage(streakProfile, 14, 1)).toContain('7 dias consecutivos');
  });
});
