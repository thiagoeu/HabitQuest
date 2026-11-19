import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, getTodayDateString } from '../../store/useAppStore';
import { computeQuestProgress, QuestProgressSummary } from '../../domain/questProgressService';
import {
  CATEGORY_META,
  DIFFICULTY_META,
  QUEST_STATUS_META,
  formatDateShort,
} from '../../constants/questPresentation';

type QuestFilter = 'todas' | 'ativas' | 'continuas' | 'futuras' | 'concluidas';

const FILTER_OPTIONS: { key: QuestFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'ativas', label: 'Ativas' },
  { key: 'continuas', label: 'Contínuas' },
  { key: 'futuras', label: 'Futuras' },
  { key: 'concluidas', label: 'Concluídas' },
];

function matchesFilter(summary: QuestProgressSummary, filter: QuestFilter): boolean {
  switch (filter) {
    case 'ativas':
      return summary.status === 'ativa';
    case 'continuas':
      return summary.status === 'continua';
    case 'futuras':
      return summary.status === 'futura';
    case 'concluidas':
      return summary.status === 'concluida' || summary.status === 'encerrada';
    default:
      return true;
  }
}

export default function QuestsScreen() {
  const router = useRouter();
  const today = getTodayDateString();

  const habits = useAppStore((state) => state.habits);
  const checkIns = useAppStore((state) => state.checkIns);
  const questRewards = useAppStore((state) => state.questRewards) || [];

  const [selectedFilter, setSelectedFilter] = useState<QuestFilter>('todas');

  const summaries = useMemo(() => {
    const activeHabits = habits.filter((h) => !h.archived);
    return activeHabits.map((habit) =>
      computeQuestProgress(habit, checkIns, questRewards, today)
    );
  }, [habits, checkIns, questRewards, today]);

  const filteredSummaries = useMemo(
    () => summaries.filter((item) => matchesFilter(item, selectedFilter)),
    [summaries, selectedFilter]
  );

  const stats = useMemo(() => {
    const total = summaries.length;
    const inProgress = summaries.filter(
      (s) => s.status === 'ativa' || s.status === 'continua'
    ).length;
    const completed = summaries.filter((s) => s.status === 'concluida').length;
    const totalBonusXp = questRewards.reduce((acc, r) => acc + r.xpGained, 0);
    return { total, inProgress, completed, totalBonusXp };
  }, [summaries, questRewards]);

  const renderRewardLine = (item: QuestProgressSummary) => {
    if (item.isBounded) {
      if (item.periodReward) {
        const isPerfect = item.periodReward.kind === 'period_perfect';
        return (
          <Text style={styles.rewardEarnedText}>
            Bônus resgatado: +{item.periodReward.xpGained} XP
            {isPerfect ? ' (Quest Perfeita)' : ''}
          </Text>
        );
      }

      if (item.status === 'encerrada') {
        return (
          <Text style={styles.rewardMissedText}>
            Prazo encerrado sem atingir a meta mínima ({Math.round(item.minRequiredRate * 100)}%)
          </Text>
        );
      }

      return (
        <Text style={styles.rewardProjectedText}>
          Bônus fixo: +{item.projectedFixedXp} XP
          {item.supportsPerfectBonus ? ` • Perfeita: +${item.perfectFixedXp} XP` : ''}
        </Text>
      );
    }

    if (item.nextMilestone) {
      return (
        <Text style={styles.rewardProjectedText}>
          Próximo marco ({item.nextMilestone.label}): +{item.nextMilestone.xpReward} XP
          {item.xpEarnedFromBonuses > 0 ? ` • Ganhos: +${item.xpEarnedFromBonuses} XP` : ''}
        </Text>
      );
    }

    return (
      <Text style={styles.rewardEarnedText}>
        Todos os marcos concluídos (+{item.xpEarnedFromBonuses} XP em bônus)
      </Text>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Painel Resumo de Quests */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>PAINEL DE QUESTS</Text>
        <Text style={styles.summarySubtitle}>
          Acompanhe todas as suas tarefas, metas por prazo e bônus de duração em um só lugar.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#a5b4fc' }]}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Em Curso</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#fbbf24' }]}>
              {stats.totalBonusXp}
            </Text>
            <Text style={styles.statLabel}>XP Bônus</Text>
          </View>
        </View>
      </View>

      {/* Cabecalho e Acao Nova Quest */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Todas as Quests ({filteredSummaries.length})
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/habit-form')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Nova Quest</Text>
        </TouchableOpacity>
      </View>

      {/* Barra Horizontal de Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTER_OPTIONS.map((option) => {
          const count = summaries.filter((s) => matchesFilter(s, option.key)).length;
          const isActive = selectedFilter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(option.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Listagem de Quests */}
      {summaries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma quest cadastrada ainda</Text>
          <Text style={styles.emptySubtitle}>
            Crie sua primeira tarefa semanal, mensal ou contínua para acompanhar sua evolução aqui.
          </Text>
        </View>
      ) : filteredSummaries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma quest neste filtro</Text>
          <Text style={styles.emptySubtitle}>
            Selecione outra categoria acima ou cadastre uma nova quest para começar.
          </Text>
        </View>
      ) : (
        filteredSummaries.map((item) => {
          const categoryMeta = CATEGORY_META[item.habit.category] || CATEGORY_META.disciplina;
          const difficultyMeta = DIFFICULTY_META[item.habit.difficulty] || DIFFICULTY_META.medio;
          const statusMeta = QUEST_STATUS_META[item.status];
          const progressPercent = Math.min(100, Math.round(item.completionRate * 100));

          const progressLabel = item.isBounded
            ? `${item.completedCount}/${item.scheduledCount} dias (${progressPercent}%)`
            : item.nextMilestone
              ? `${item.completedCount}/${item.nextMilestone.days} até ${item.nextMilestone.label}`
              : `${item.completedCount} check-ins acumulados`;

          const rightTimeLabel = item.isBounded
            ? item.status === 'futura'
              ? `Inicia em ${formatDateShort(item.effectiveStartDate)}`
              : item.daysRemaining && item.daysRemaining > 0
                ? `${item.daysRemaining} ${item.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                : 'Prazo finalizado'
            : `${item.habit.currentStreak} dias de ofensiva`;

          return (
            <TouchableOpacity
              key={item.habit.id}
              style={styles.questCard}
              onPress={() =>
                router.push({ pathname: '/quest-detail', params: { id: item.habit.id } })
              }
              activeOpacity={0.8}
            >
              {/* Topo: Titulo + Status */}
              <View style={styles.cardTopRow}>
                <Text style={styles.questTitle} numberOfLines={2}>
                  {item.habit.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusMeta.bg,
                      borderColor: statusMeta.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              {/* Badges de Categoria, Dificuldade, Faixa e Vigencia */}
              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: categoryMeta.bg, borderColor: categoryMeta.color },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: categoryMeta.color }]}>
                    {categoryMeta.label}
                  </Text>
                </View>

                <View style={styles.neutralBadge}>
                  <Text style={[styles.badgeText, { color: difficultyMeta.color }]}>
                    {difficultyMeta.label}
                  </Text>
                </View>

                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>{item.tierShortLabel}</Text>
                </View>

                {item.isBounded && item.effectiveEndDate && (
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>
                      {formatDateShort(item.effectiveStartDate)} →{' '}
                      {formatDateShort(item.effectiveEndDate)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Barra de Evolucao */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{progressLabel}</Text>
                  <Text style={styles.progressRight}>{rightTimeLabel}</Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor:
                          item.status === 'concluida'
                            ? '#10b981'
                            : item.status === 'encerrada'
                              ? '#6b7280'
                              : '#6366f1',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Recompensa XP */}
              <View style={styles.rewardRow}>{renderRewardLine(item)}</View>

              {/* Rodape: Editar e Ver Evolucao */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.editChip}
                  onPress={() =>
                    router.push({ pathname: '/habit-form', params: { id: item.habit.id } })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.editChipText}>Editar</Text>
                </TouchableOpacity>
                <Text style={styles.detailHint}>Ver evolução &gt;</Text>
              </View>
            </TouchableOpacity>
          );
        })
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summarySubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#161622',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262638',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersScroll: {
    marginBottom: 14,
  },
  filtersRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#262638',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#4f46e533',
    borderColor: '#6366f1',
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#161622',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232333',
    marginTop: 8,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  questCard: {
    backgroundColor: '#1e1e2d',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  questTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  neutralBadge: {
    backgroundColor: '#262638',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tierBadge: {
    backgroundColor: '#312e8155',
    borderColor: '#4f46e5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierBadgeText: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: '700',
  },
  dateBadge: {
    backgroundColor: '#161622',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: 8,
  },
  progressLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  progressRight: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  barBg: {
    height: 8,
    backgroundColor: '#262638',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardRow: {
    backgroundColor: '#161622',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#262638',
  },
  rewardProjectedText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardEarnedText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  rewardMissedText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editChip: {
    backgroundColor: '#262638',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  editChipText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
  detailHint: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
});
