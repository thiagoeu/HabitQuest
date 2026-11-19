import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, getTodayDateString } from '../../store/useAppStore';
import { ProfileHeader } from '../../components/ProfileHeader';
import { HabitCard } from '../../components/HabitCard';
import { getSelfEfficacyMessage } from '../../domain/motivationalQuotes';
import { Habit } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const today = getTodayDateString();

  const profile = useAppStore((state) => state.profile);
  const habits = useAppStore((state) => state.habits);
  const checkIns = useAppStore((state) => state.checkIns);
  const completeHabit = useAppStore((state) => state.completeHabit);
  const uncompleteHabit = useAppStore((state) => state.uncompleteHabit);
  const getHabitsForDate = useAppStore((state) => state.getHabitsForDate);
  const isHabitCompletedOnDate = useAppStore((state) => state.isHabitCompletedOnDate);

  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const todayHabits = getHabitsForDate(today);
  const pendingHabits = todayHabits.filter((h) => !isHabitCompletedOnDate(h.id, today));
  const completedHabits = todayHabits.filter((h) => isHabitCompletedOnDate(h.id, today));

  const motivationalMessage = getSelfEfficacyMessage(
    profile,
    checkIns.length,
    pendingHabits.length
  );

  const handleToggleHabit = (habit: Habit) => {
    const isCompleted = isHabitCompletedOnDate(habit.id, today);

    if (isCompleted) {
      uncompleteHabit(habit.id, today);
      setNotificationBanner(null);
    } else {
      const { leveledUp, unlockedAchievements, unlockedQuestRewards } = completeHabit(
        habit.id,
        today
      );
      const updatedLevel = useAppStore.getState().profile.level;

      let feedback = `Meta '${habit.title}' concluída!`;
      if (unlockedQuestRewards.length > 0) {
        const totalBonusXp = unlockedQuestRewards.reduce((sum, r) => sum + r.xpGained, 0);
        const primary = unlockedQuestRewards[0];
        const bonusLabel =
          primary.kind === 'period_perfect'
            ? 'BÔNUS QUEST PERFEITA'
            : primary.kind === 'period_completion'
              ? 'BÔNUS DE QUEST CONCLUÍDA'
              : `MARCO DE ${primary.milestoneDays} DIAS`;

        feedback = `${bonusLabel}: +${totalBonusXp} XP em '${habit.title}'!`;
        if (leveledUp) {
          feedback += ` Você subiu para o NÍVEL ${updatedLevel}!`;
        }
      } else if (leveledUp) {
        feedback = `PARABÉNS! Você subiu para o NÍVEL ${updatedLevel}!`;
      } else if (unlockedAchievements.length > 0) {
        feedback = `NOVA CONQUISTA: ${unlockedAchievements[0].title}!`;
      }

      setNotificationBanner(feedback);
      setTimeout(() => setNotificationBanner(null), 4000);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner de Feedback Gamificado */}
      {notificationBanner && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{notificationBanner}</Text>
        </View>
      )}

      {/* Cabecalho de Perfil */}
      <ProfileHeader profile={profile} />

      {/* Frase Motivacional de Autoeficacia */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteTitle}>FOCO DO DIA</Text>
        <Text style={styles.quoteText}>{motivationalMessage}</Text>
      </View>

      {/* Botao Nova Meta */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          Metas de Hoje ({completedHabits.length}/{todayHabits.length})
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/habit-form')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Nova Meta</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Metas Pendentes */}
      {pendingHabits.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.subSectionTitle}>A Realizar ({pendingHabits.length})</Text>
          {pendingHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={false}
              onToggleComplete={() => handleToggleHabit(habit)}
              onPressEdit={() => router.push({ pathname: '/habit-form', params: { id: habit.id } })}
            />
          ))}
        </View>
      ) : todayHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhuma meta programada para hoje</Text>
          <Text style={styles.emptySubtitle}>
            Toque no botão acima para cadastrar seus primeiros objetivos de estudo ou academia.
          </Text>
        </View>
      ) : (
        <View style={styles.allDoneContainer}>
          <Text style={styles.allDoneTitle}>Todas as metas de hoje foram superadas!</Text>
          <Text style={styles.allDoneSubtitle}>Você manteve sua consistência e reforçou seu progresso.</Text>
        </View>
      )}

      {/* Lista de Metas Concluidas */}
      {completedHabits.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.subSectionTitle}>Concluídas Hoje ({completedHabits.length})</Text>
          {completedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={true}
              onToggleComplete={() => handleToggleHabit(habit)}
              onPressEdit={() => router.push({ pathname: '/habit-form', params: { id: habit.id } })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c12',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  feedbackBanner: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#818cf8',
  },
  feedbackText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  quoteCard: {
    backgroundColor: '#161622',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    marginBottom: 16,
  },
  quoteTitle: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quoteText: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  listSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 2,
  },
  emptyContainer: {
    backgroundColor: '#161622',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#232333',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  allDoneContainer: {
    backgroundColor: '#064e3b33',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  allDoneTitle: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  allDoneSubtitle: {
    color: '#a7f3d0',
    fontSize: 12,
    textAlign: 'center',
  },
});
