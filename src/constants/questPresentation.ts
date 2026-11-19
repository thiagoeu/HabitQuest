import { AttributeCategory, Difficulty, QuestLifecycleStatus } from '../types';

export const CATEGORY_META: Record<
  AttributeCategory,
  { label: string; color: string; bg: string }
> = {
  intelecto: { label: 'Intelecto', color: '#60a5fa', bg: '#1e3a8a33' },
  forca: { label: 'Força', color: '#fb923c', bg: '#7c2d1233' },
  disciplina: { label: 'Disciplina', color: '#c084fc', bg: '#581c8733' },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: '#34d399' },
  medio: { label: 'Médio', color: '#fbbf24' },
  dificil: { label: 'Difícil', color: '#f87171' },
};

export const QUEST_STATUS_META: Record<
  QuestLifecycleStatus,
  { label: string; color: string; bg: string; borderColor: string }
> = {
  ativa: {
    label: 'Ativa',
    color: '#a5b4fc',
    bg: '#4f46e522',
    borderColor: '#6366f1',
  },
  continua: {
    label: 'Contínua',
    color: '#38bdf8',
    bg: '#0284c722',
    borderColor: '#0ea5e9',
  },
  futura: {
    label: 'Futura',
    color: '#fbbf24',
    bg: '#b4530922',
    borderColor: '#f59e0b',
  },
  concluida: {
    label: 'Concluída',
    color: '#34d399',
    bg: '#065f4633',
    borderColor: '#10b981',
  },
  encerrada: {
    label: 'Encerrada',
    color: '#9ca3af',
    bg: '#37415133',
    borderColor: '#6b7280',
  },
};

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

export function formatDateFull(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatDaysOfWeekSummary(daysOfWeek: number[]): string {
  if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.length === 7) {
    return 'Todos os dias';
  }
  return [...daysOfWeek]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_NAMES[day] || '')
    .filter(Boolean)
    .join(', ');
}
