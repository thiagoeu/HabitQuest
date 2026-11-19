import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, getTodayDateString } from '../store/useAppStore';
import { computeQuestProgress, QuestTimelineDay } from '../domain/questProgressService';
import {
  CATEGORY_META,
  DIFFICULTY_META,
  QUEST_STATUS_META,
  formatDateFull,
  formatDateShort,
  formatDaysOfWeekSummary,
} from '../constants/questPresentation';

const TIMELINE_CELL_STYLES: Record<
  QuestTimelineDay['state'],
  { bg: string; border: string; text: string }
> = {
  completed: { bg: '#065f4655', border: '#10b981', text: '#6ee7b7' },
  missed: { bg: '#7f1d1d44', border: '#ef4444', text: '#fca5a5' },
  pending_today: { bg: '#4f46e533', border: '#818cf8', text: '#e0e7ff' },
  upcoming: { bg: '#161622', border: '#2e2e42', text: '#9ca3af' },
};

export default function QuestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const today = getTodayDateString();

  const habits = useAppStore((state) => state.habits);
  const checkIns = useAppStore((state) => state.checkIns);
  const questRewards = useAppStore((state) => state.questRewards) || [];

  const habit = useMemo(() => habits.find((h) => h.id === id), [habits, id]);

  const progress = useMemo(() => {
    if (!habit) return null;
    return computeQuestProgress(habit, checkIns, questRewards, today);
  }, [habit, checkIns, questRewards, today]);

  const habitCheckIns = useMemo(() => {
    if (!habit) return [];
    return checkIns
      .filter((c) => c.habitId === habit.id)
      .sort((a, b) => (a.date === b.date ? b.completedAt.localeCompare(a.completedAt) : b.date.localeCompare(a.date)));
  }, [habit, checkIns]);

  if (!habit || !progress) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Quest não encontrada</Text>
        <Text style={styles.notFoundSubtitle}>
          Esta meta pode ter sido excluída ou ainda não foi carregada.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryMeta = CATEGORY_META[habit.category] || CATEGORY_META.disciplina;
  const difficultyMeta = DIFFICULTY_META[habit.difficulty] || DIFFICULTY_META.medio;
  const statusMeta = QUEST_STATUS_META[progress.status];
  const progressPercent = Math.min(100, Math.round(progress.completionRate * 100));

  const renderBoundedBonusStatus = () => {
    if (progress.periodReward) {
      const isPerfect = progress.periodReward.kind === 'period_perfect';
      return (
        <View style={[styles.statusBox, styles.statusBoxSuccess]}>
          <Text style={styles.statusBoxSuccessText}>
            Bônus resgatado em {formatDateFull(progress.periodReward.triggerDate)}: +
            {progress.periodReward.xpGained} XP
            {isPerfect ? ' (Quest Perfeita)' : ''}
          </Text>
        </View>
      );
    }

    if (progress.status === 'encerrada') {
      return (
        <View style={[styles.statusBox, styles.statusBoxMuted]}>
          <Text style={styles.statusBoxMutedText}>
            Prazo encerrado abaixo da meta mínima de {Math.round(progress.minRequiredRate * 100)}%.
          </Text>
        </View>
      );
    }

    if (!progress.canStillReachMinTarget && progress.scheduledCount > 0) {
      return (
        <View style={[styles.statusBox, styles.statusBoxWarn]}>
          <Text style={styles.statusBoxWarnText}>
            A meta mínima de {Math.round(progress.minRequiredRate * 100)}% não pode mais ser
            alcançada neste prazo, mas cada check-in diário continua rendendo XP.
          </Text>
        </View>
      );
    }

    const minNeededCount = Math.ceil(progress.scheduledCount * progress.minRequiredRate);
    const missingToMin = Math.max(0, minNeededCount - progress.completedCount);

    return (
      <View style={[styles.statusBox, styles.statusBoxInfo]}>
        <Text style={styles.statusBoxInfoText}>
          No caminho para o bônus: {missingToMin === 0 ? 'meta mínima atingida!' : `faltam ${missingToMin} check-ins para garantir a meta mínima (${Math.round(progress.minRequiredRate * 100)}%).`}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabecalho da Quest */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>{habit.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMeta.bg, borderColor: statusMeta.borderColor },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

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
            <Text style={styles.tierBadgeText}>{progress.tierLabel}</Text>
          </View>
        </View>

        <View style={styles.metaList}>
          <Text style={styles.metaText}>
            Frequência: {formatDaysOfWeekSummary(habit.daysOfWeek)}
          </Text>
          <Text style={styles.metaText}>
            Vigência:{' '}
            {progress.isBounded && progress.effectiveEndDate
              ? `${formatDateFull(progress.effectiveStartDate)} até ${formatDateFull(progress.effectiveEndDate)} (${progress.calendarDays} dias)`
              : `Meta contínua desde ${formatDateFull(progress.effectiveStartDate)}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push({ pathname: '/habit-form', params: { id: habit.id } })}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Editar Quest</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo de Evolucao e Aderencia */}
      <View style={styles.sectionCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Evolução e Aderência</Text>
          <Text style={styles.progressPercentText}>{progressPercent}%</Text>
        </View>

        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  progress.status === 'concluida'
                    ? '#10b981'
                    : progress.status === 'encerrada'
                      ? '#6b7280'
                      : '#6366f1',
              },
            ]}
          />
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>
              {progress.isBounded
                ? `${progress.completedCount}/${progress.scheduledCount}`
                : `${progress.completedCount}`}
            </Text>
            <Text style={styles.metricLabel}>
              {progress.isBounded ? 'Cumpridos' : 'Check-ins'}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, { color: '#f87171' }]}>
              {progress.missedCount}
            </Text>
            <Text style={styles.metricLabel}>Perdidos</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, { color: '#a5b4fc' }]}>
              {progress.remainingCount}
            </Text>
            <Text style={styles.metricLabel}>
              {progress.isBounded ? 'Restantes' : 'Próx. Marco'}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, { color: '#fb923c' }]}>
              {habit.currentStreak}d
            </Text>
            <Text style={styles.metricLabel}>Ofensiva (Rec. {habit.bestStreak}d)</Text>
          </View>
        </View>
      </View>

      {/* Balanco de XP da Quest */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>XP Gerado por Esta Quest</Text>
        <View style={styles.xpGrid}>
          <View style={styles.xpBox}>
            <Text style={styles.xpNumber}>+{progress.xpEarnedFromCheckIns}</Text>
            <Text style={styles.xpLabel}>XP Diário</Text>
          </View>
          <View style={styles.xpBox}>
            <Text style={[styles.xpNumber, { color: '#fbbf24' }]}>
              +{progress.xpEarnedFromBonuses}
            </Text>
            <Text style={styles.xpLabel}>XP Bônus</Text>
          </View>
          <View style={styles.xpBox}>
            <Text style={[styles.xpNumber, { color: '#34d399' }]}>
              +{progress.totalXpEarned}
            </Text>
            <Text style={styles.xpLabel}>Total da Quest</Text>
          </View>
        </View>
      </View>

      {/* Estrategia de Recompensa / Marcos */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {progress.isBounded ? 'Recompensa por Duração' : 'Marcos de Permanência'}
        </Text>

        {progress.isBounded ? (
          <View>
            <View style={styles.rewardDetailRow}>
              <Text style={styles.rewardDetailLabel}>Faixa de Duração:</Text>
              <Text style={styles.rewardDetailValue}>{progress.tierLabel}</Text>
            </View>
            <View style={styles.rewardDetailRow}>
              <Text style={styles.rewardDetailLabel}>Meta Mínima Exigida:</Text>
              <Text style={styles.rewardDetailValue}>
                {Math.round(progress.minRequiredRate * 100)}% dos dias programados
              </Text>
            </View>
            <View style={styles.rewardDetailRow}>
              <Text style={styles.rewardDetailLabel}>Bônus Fixo da Quest:</Text>
              <Text style={[styles.rewardDetailValue, { color: '#a5b4fc' }]}>
                +{progress.projectedFixedXp} XP
              </Text>
            </View>
            {progress.supportsPerfectBonus && (
              <View style={styles.rewardDetailRow}>
                <Text style={styles.rewardDetailLabel}>Quest Perfeita (100%):</Text>
                <Text style={[styles.rewardDetailValue, { color: '#34d399' }]}>
                  +{progress.perfectFixedXp} XP (+20%)
                </Text>
              </View>
            )}
            {renderBoundedBonusStatus()}
          </View>
        ) : (
          <View style={styles.milestonesList}>
            {progress.milestones.map((m) => (
              <View
                key={m.days}
                style={[styles.milestoneRow, m.achieved && styles.milestoneRowAchieved]}
              >
                <View>
                  <Text style={styles.milestoneTitle}>
                    {m.label} ({m.days} check-ins)
                  </Text>
                  <Text style={styles.milestoneSub}>
                    {m.achieved
                      ? 'Marco conquistado'
                      : m.remainingCheckIns === 0
                        ? 'Elegível no próximo check-in'
                        : `Faltam ${m.remainingCheckIns} check-ins`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.milestoneXp,
                    m.achieved ? { color: '#34d399' } : { color: '#a5b4fc' },
                  ]}
                >
                  +{m.xpReward} XP
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Linha do Tempo Visual */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {progress.isBounded
            ? 'Mapa dos Dias Programados'
            : 'Últimos 30 Dias Programados'}
        </Text>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Cumprido</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Perdido</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#818cf8' }]} />
            <Text style={styles.legendText}>Hoje</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#475569' }]} />
            <Text style={styles.legendText}>Futuro</Text>
          </View>
        </View>

        {progress.timeline.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum dia programado registrado neste intervalo ainda.
          </Text>
        ) : (
          <View style={styles.timelineGrid}>
            {progress.timeline.map((day) => {
              const palette = TIMELINE_CELL_STYLES[day.state];
              return (
                <View
                  key={day.date}
                  style={[
                    styles.timelineCell,
                    { backgroundColor: palette.bg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[styles.timelineCellText, { color: palette.text }]}>
                    {formatDateShort(day.date)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Historico de Bonus e Check-ins da Quest */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Histórico de Evolução da Quest</Text>

        {progress.claimedRewards.length > 0 && (
          <View style={styles.bonusHistoryBlock}>
            <Text style={styles.subHeader}>Bônus Conquistados</Text>
            {progress.claimedRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardHistoryItem}>
                <View>
                  <Text style={styles.rewardHistoryTitle}>
                    {reward.kind === 'period_perfect'
                      ? 'Bônus Quest Perfeita'
                      : reward.kind === 'period_completion'
                        ? 'Bônus de Conclusão do Prazo'
                        : `Marco Contínuo (${reward.milestoneDays} check-ins)`}
                  </Text>
                  <Text style={styles.historyDate}>
                    Concedido em {formatDateFull(reward.triggerDate)}
                  </Text>
                </View>
                <Text style={styles.rewardHistoryXp}>+{reward.xpGained} XP</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.subHeader}>Check-ins Registrados ({habitCheckIns.length})</Text>
        {habitCheckIns.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum check-in registrado para esta quest até o momento.
          </Text>
        ) : (
          habitCheckIns.slice(0, 20).map((item) => (
            <View key={item.id} style={styles.checkInRow}>
              <View>
                <Text style={styles.checkInDate}>{formatDateFull(item.date)}</Text>
                <Text style={styles.checkInDetails}>
                  +{item.xpGained} XP • +{item.attributePointsGained} pts em{' '}
                  {CATEGORY_META[item.attributeGained]?.label || item.attributeGained} • +
                  {item.hpGained} HP
                </Text>
              </View>
              <View style={styles.donePill}>
                <Text style={styles.donePillText}>Feito</Text>
              </View>
            </View>
          ))
        )}
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
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#0c0c12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  notFoundSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#1e1e2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#373752',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  neutralBadge: {
    backgroundColor: '#262638',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierBadgeText: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: '700',
  },
  metaList: {
    gap: 4,
    marginBottom: 14,
  },
  metaText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#262638',
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#161622',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#232333',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressPercentText: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  barBg: {
    height: 10,
    backgroundColor: '#262638',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricBox: {
    width: '48.5%',
    backgroundColor: '#1e1e2d',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  xpGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  xpBox: {
    flex: 1,
    backgroundColor: '#1e1e2d',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  xpNumber: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  xpLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  rewardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
  },
  rewardDetailLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  rewardDetailValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBoxSuccess: {
    backgroundColor: '#065f4633',
    borderColor: '#10b981',
  },
  statusBoxSuccessText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBoxInfo: {
    backgroundColor: '#312e8144',
    borderColor: '#6366f1',
  },
  statusBoxInfoText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBoxWarn: {
    backgroundColor: '#78350f33',
    borderColor: '#f59e0b',
  },
  statusBoxWarnText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBoxMuted: {
    backgroundColor: '#1f293744',
    borderColor: '#4b5563',
  },
  statusBoxMutedText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  milestonesList: {
    gap: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e2d',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  milestoneRowAchieved: {
    backgroundColor: '#064e3b33',
    borderColor: '#10b981',
  },
  milestoneTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneSub: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  milestoneXp: {
    fontSize: 13,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  timelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timelineCell: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  timelineCellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bonusHistoryBlock: {
    marginBottom: 14,
  },
  subHeader: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rewardHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#064e3b33',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  rewardHistoryTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  rewardHistoryXp: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '800',
  },
  historyDate: {
    color: '#a7f3d0',
    fontSize: 11,
    marginTop: 2,
  },
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
  },
  checkInDate: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  checkInDetails: {
    color: '#9ca3af',
    fontSize: 11,
  },
  donePill: {
    backgroundColor: '#064e3b44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
  },
  donePillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
