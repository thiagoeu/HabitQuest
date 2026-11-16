import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit, AttributeCategory, Difficulty } from '../types';
import { calculateXpGain } from '../domain/gamificationEngine';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  onToggleComplete: () => void;
  onPressEdit?: () => void;
}

const CATEGORY_CONFIG: Record<AttributeCategory, { label: string; color: string; bg: string }> = {
  intelecto: { label: 'Intelecto', color: '#60a5fa', bg: '#1e3a8a33' },
  forca: { label: 'Força', color: '#fb923c', bg: '#7c2d1233' },
  disciplina: { label: 'Disciplina', color: '#c084fc', bg: '#581c8733' },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: '#34d399' },
  medio: { label: 'Médio', color: '#fbbf24' },
  dificil: { label: 'Difícil', color: '#f87171' },
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completed,
  onToggleComplete,
  onPressEdit,
}) => {
  const category = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.disciplina;
  const difficulty = DIFFICULTY_CONFIG[habit.difficulty] || DIFFICULTY_CONFIG.medio;
  const xpReward = calculateXpGain(habit.difficulty, habit.currentStreak);

  // Formatador simples de periodo (AAAA-MM-DD -> DD/MM)
  const formatShortDate = (d?: string | null) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return d;
  };

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      {/* Botao de Check-in */}
      <TouchableOpacity
        style={[styles.checkbox, completed && styles.checkboxCompleted]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        {completed && <Text style={styles.checkmark}>V</Text>}
      </TouchableOpacity>

      {/* Conteudo Central */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPressEdit}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={1}>
          {habit.title}
        </Text>

        <View style={styles.metadataRow}>
          {/* Badge Categoria */}
          <View style={[styles.badge, { backgroundColor: category.bg, borderColor: category.color }]}>
            <Text style={[styles.badgeText, { color: category.color }]}>{category.label}</Text>
          </View>

          {/* Badge Dificuldade */}
          <View style={styles.badgeDifficulty}>
            <Text style={[styles.badgeText, { color: difficulty.color }]}>{difficulty.label}</Text>
          </View>

          {/* Recompensa XP */}
          <Text style={styles.xpText}>+{xpReward} XP</Text>

          {/* Indicador de Alarme */}
          {habit.reminderEnabled && habit.reminderTime && (
            <View style={styles.alarmBadge}>
              <Text style={styles.reminderText}>Alarme: {habit.reminderTime}</Text>
              {habit.earlyReminderEnabled && (
                <Text style={styles.earlyReminderTag}>-10m</Text>
              )}
            </View>
          )}

          {/* Indicador de Periodo de Vigencia */}
          {(habit.startDate || habit.endDate) && (
            <View style={styles.dateRangeBadge}>
              <Text style={styles.dateRangeText}>
                {habit.startDate ? formatShortDate(habit.startDate) : 'Início'}
                {' → '}
                {habit.endDate ? formatShortDate(habit.endDate) : 'Sempre'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Indicador de Ofensiva */}
      {habit.currentStreak > 0 && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakCount}>{habit.currentStreak}</Text>
          <Text style={styles.streakLabel}>dias</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2d',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  cardCompleted: {
    opacity: 0.75,
    backgroundColor: '#181824',
    borderColor: '#27273a',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeDifficulty: {
    backgroundColor: '#262638',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  xpText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
  },
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262638',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  reminderText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '500',
  },
  earlyReminderTag: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#78350f44',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  dateRangeBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateRangeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  streakContainer: {
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#262638',
    borderRadius: 8,
  },
  streakCount: {
    color: '#f97316',
    fontWeight: '700',
    fontSize: 13,
  },
  streakLabel: {
    color: '#9ca3af',
    fontSize: 9,
    textTransform: 'uppercase',
  },
});
