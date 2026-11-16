import { UserProfile } from '../types';

export const STATIC_MOTIVATIONAL_QUOTES = [
  'A disciplina de hoje constrói a sua liberdade de amanhã.',
  'Você não precisa ser perfeito, apenas constante.',
  'Cada meta cumprida é um voto de confiança em você mesmo.',
  'Sua melhor versão é forjada naquilo que você faz todos os dias.',
  'Você já provou que é capaz: dê mais um passo hoje!',
  'Pequenas vitórias diárias constroem transformações gigantes.',
  'O cansaço passa, mas o orgulho de cumprir sua palavra permanece.',
];

/**
 * Retorna uma frase motivacional aleatória ou contextualizada
 */
export function getRandomMotivationalQuote(): string {
  const index = Math.floor(Math.random() * STATIC_MOTIVATIONAL_QUOTES.length);
  return STATIC_MOTIVATIONAL_QUOTES[index];
}

/**
 * Gera mensagem de autoeficácia dinâmica baseada no histórico real de superação
 */
export function getSelfEfficacyMessage(
  profile: UserProfile,
  totalCheckIns: number,
  pendingToday: number
): string {
  if (profile.inSecondChance) {
    return 'Momento de virada! Conclua sua primeira meta para recuperar energia e restabelecer sua rota.';
  }

  if (pendingToday === 0 && totalCheckIns > 0) {
    return 'Missão cumprida por hoje! Você bateu todas as suas metas e reforçou sua consistência.';
  }

  if (profile.globalStreak >= 7) {
    return `Incrível! Você mantém uma sequência de ${profile.globalStreak} dias consecutivos. Você está imparável!`;
  }

  if (profile.globalStreak >= 3) {
    return `Você já está há ${profile.globalStreak} dias firmes no foco! Continue avançando hoje.`;
  }

  if (totalCheckIns >= 10) {
    return `Você já venceu ${totalCheckIns} metas no total! Você sabe exatamente como cumprir seus objetivos.`;
  }

  if (totalCheckIns > 0) {
    return `Você já concluiu ${totalCheckIns} meta(s). Mantenha o ritmo e vença mais uma hoje!`;
  }

  return 'O primeiro passo é o mais importante. Escolha uma meta e prove a si mesmo que você consegue!';
}
