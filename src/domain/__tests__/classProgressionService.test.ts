import {
  CLASSES_CATALOG,
  getClassDetails,
  getAllClasses,
  checkClassRequirements,
  canEvolveToClass,
  evolveOrSwitchClass,
  getClassAttributeMultiplier,
} from '../classProgressionService';
import { createInitialProfile } from '../gamificationEngine';
import { UserProfile } from '../../types';

describe('ClassProgressionService', () => {
  let initialProfile: UserProfile;

  beforeEach(() => {
    initialProfile = createInitialProfile();
  });

  test('catalogo contem todas as 6 classes mapeadas', () => {
    const classes = getAllClasses();
    expect(classes).toHaveLength(6);
    const ids = classes.map((c) => c.id);
    expect(ids).toContain('aprendiz');
    expect(ids).toContain('monge');
    expect(ids).toContain('cavaleiro');
    expect(ids).toContain('sabio');
    expect(ids).toContain('arqueiro');
    expect(ids).toContain('exorcista');
  });

  test('perfil inicial e Aprendiz e nao atende de imediato aos requisitos de classes avancadas', () => {
    expect(initialProfile.currentClass).toBe('aprendiz');
    expect(initialProfile.unlockedClasses).toEqual(['aprendiz']);

    const mongeCheck = checkClassRequirements('monge', initialProfile);
    expect(mongeCheck.eligible).toBe(false);
    expect(mongeCheck.reasons.length).toBeGreaterThan(0);
    expect(canEvolveToClass('monge', initialProfile)).toBe(false);
  });

  test('evolucao falha se nivel ou atributos forem insuficientes', () => {
    const result = evolveOrSwitchClass('cavaleiro', initialProfile);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.updatedProfile.currentClass).toBe('aprendiz');
  });

  test('evolucao e bem-sucedida quando o jogador atinge o nivel e atributos requeridos', () => {
    const qualifiedProfile: UserProfile = {
      ...initialProfile,
      level: 5,
      attributes: {
        intelecto: { points: 10, level: 1 },
        forca: { points: 25, level: 1 },
        disciplina: { points: 5, level: 1 },
      },
    };

    const cavaleiroCheck = checkClassRequirements('cavaleiro', qualifiedProfile);
    expect(cavaleiroCheck.eligible).toBe(true);
    expect(canEvolveToClass('cavaleiro', qualifiedProfile)).toBe(true);

    const result = evolveOrSwitchClass('cavaleiro', qualifiedProfile);
    expect(result.success).toBe(true);
    expect(result.updatedProfile.currentClass).toBe('cavaleiro');
    expect(result.updatedProfile.unlockedClasses).toContain('cavaleiro');
    expect(result.updatedProfile.unlockedClasses).toContain('aprendiz');
  });

  test('permite alternancia livre entre classes ja desbloqueadas sem verificar atributos novamente', () => {
    const profileWithClasses: UserProfile = {
      ...initialProfile,
      currentClass: 'monge',
      unlockedClasses: ['aprendiz', 'monge', 'sabio'],
      // Atributos atuais menores nao devem travar a troca entre classes ja conquistadas
      attributes: {
        intelecto: { points: 0, level: 1 },
        forca: { points: 0, level: 1 },
        disciplina: { points: 0, level: 1 },
      },
    };

    const result = evolveOrSwitchClass('sabio', profileWithClasses);
    expect(result.success).toBe(true);
    expect(result.updatedProfile.currentClass).toBe('sabio');
  });

  test('retorna multiplicador de afinidade passiva por classe', () => {
    expect(getClassAttributeMultiplier('aprendiz', 'disciplina')).toBe(1.0);
    expect(getClassAttributeMultiplier('monge', 'disciplina')).toBe(1.25);
    expect(getClassAttributeMultiplier('cavaleiro', 'forca')).toBe(1.25);
    expect(getClassAttributeMultiplier('sabio', 'intelecto')).toBe(1.25);
    expect(getClassAttributeMultiplier('arqueiro', 'disciplina')).toBe(1.15);
    expect(getClassAttributeMultiplier('exorcista', 'forca')).toBe(1.15);
  });
});
