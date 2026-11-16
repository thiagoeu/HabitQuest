import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { AchievementBadge } from '../../components/AchievementBadge';

export default function AchievementsScreen() {
  const achievements = useAppStore((state) => state.achievements);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner Resumo de Medalhas */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>SUA COLEÇÃO DE CONQUISTAS</Text>
        <Text style={styles.summaryCount}>
          {unlockedCount} de {totalCount} Medalhas ({percent}%)
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.summaryDesc}>
          Cada conquista representa um marco de disciplina e consistência superado na sua jornada.
        </Text>
      </View>

      {/* Lista de Conquistas */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Medalhas Disponíveis</Text>
        {achievements.map((item) => (
          <AchievementBadge key={item.id} achievement={item} />
        ))}
      </View>
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
  summaryCard: {
    backgroundColor: '#1e1e2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#373752',
  },
  summaryTitle: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  summaryCount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  barBg: {
    height: 8,
    backgroundColor: '#262638',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  summaryDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
  },
  listSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
});
