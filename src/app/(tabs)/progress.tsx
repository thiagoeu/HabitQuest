import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppStore, getTodayDateString } from '../../store/useAppStore';
import { useDungeonStore } from '../../store/useDungeonStore';
import { ATTRIBUTE_POINTS_PER_LEVEL } from '../../domain/gamificationEngine';
import { getClassDetails } from '../../domain/classProgressionService';
import { ClassIcon } from '../../components/rpg/ClassIcon';

export default function ProgressScreen() {
  const profile = useAppStore((state) => state.profile);
  const habits = useAppStore((state) => state.habits);
  const checkIns = useAppStore((state) => state.checkIns);

  const battlesWonCount = useDungeonStore((state) => state.getBattlesWonCount());
  const defeatedCount = useDungeonStore((state) => state.getDefeatedCount());
  const currentClass = getClassDetails(profile.currentClass);

  // Calcula ultimos 7 dias para o mapa visual de superacao
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = getTodayDateString(d);
    const dayLabel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
    const count = checkIns.filter((c) => c.date === dateStr).length;
    return { dateStr, dayLabel, count, isCompleted: count > 0 };
  });

  const habitsMap = new Map(habits.map((h) => [h.id, h.title]));

  // Calcula progresso dos atributos
  const renderAttributeProgress = (
    name: string,
    points: number,
    level: number,
    color: string
  ) => {
    const pointsInCurrentLevel = points % ATTRIBUTE_POINTS_PER_LEVEL;
    const percent = Math.min(
      100,
      Math.round((pointsInCurrentLevel / ATTRIBUTE_POINTS_PER_LEVEL) * 100)
    );

    return (
      <View key={name} style={styles.attributeBlock}>
        <View style={styles.attributeHeader}>
          <Text style={[styles.attributeTitle, { color }]}>{name}</Text>
          <Text style={styles.attributeLevel}>Nível {level} ({points} pts)</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.attributeSub}>
          {pointsInCurrentLevel} / {ATTRIBUTE_POINTS_PER_LEVEL} pts para o próximo nível ({percent}%)
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Quadro de Superacao (Autoeficacia) */}
      <View style={styles.cardHighlight}>
        <Text style={styles.cardHighlightTitle}>HISTÓRICO DE SUPERAÇÃO</Text>
        <Text style={styles.cardHighlightDesc}>
          Evidência concreta da sua capacidade diária de cumprir o que planeja.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{checkIns.length}</Text>
            <Text style={styles.statLabel}>Metas Vencidas</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.globalStreak}</Text>
            <Text style={styles.statLabel}>Ofensiva Atual</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.bestGlobalStreak}</Text>
            <Text style={styles.statLabel}>Recorde de Dias</Text>
          </View>
        </View>
      </View>

      {/* Painel de Expedicoes e Combate RPG */}
      <View style={styles.sectionCard}>
        <View style={styles.rpgHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Conquistas de Combate & Masmorras</Text>
            <Text style={styles.rpgSubtitle}>
              Classe Ativa: {currentClass.name} • {currentClass.title}
            </Text>
          </View>
          <ClassIcon classId={profile.currentClass} size={38} />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#0EA5E9' }]}>{defeatedCount}</Text>
            <Text style={styles.statLabel}>Especies Vencidas</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{battlesWonCount}</Text>
            <Text style={styles.statLabel}>Batalhas Ganhas</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{profile.goldBalance || 0}</Text>
            <Text style={styles.statLabel}>Ouro Acumulado</Text>
          </View>
        </View>
      </View>

      {/* Mapa Visual dos Ultimos 7 Dias */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Consistência nos Últimos 7 Dias</Text>
        <View style={styles.weekRow}>
          {last7Days.map((d) => (
            <View key={d.dateStr} style={styles.dayCol}>
              <View
                style={[
                  styles.dayBadge,
                  d.isCompleted ? styles.dayBadgeActive : styles.dayBadgeInactive,
                ]}
              >
                <Text style={styles.dayBadgeCount}>{d.count > 0 ? `${d.count}x` : '-'}</Text>
              </View>
              <Text style={styles.dayLabel}>{d.dayLabel}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Detalhamento dos Atributos */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Evolução dos Atributos</Text>
        {renderAttributeProgress(
          'Intelecto (Estudos & Aprendizado)',
          profile.attributes.intelecto?.points || 0,
          profile.attributes.intelecto?.level || 1,
          '#60a5fa'
        )}
        {renderAttributeProgress(
          'Força (Academia, Saúde & Vitalidade)',
          profile.attributes.forca?.points || 0,
          profile.attributes.forca?.level || 1,
          '#fb923c'
        )}
        {renderAttributeProgress(
          'Disciplina (Rotina, Foco & Consistência)',
          profile.attributes.disciplina?.points || 0,
          profile.attributes.disciplina?.level || 1,
          '#c084fc'
        )}
      </View>

      {/* Registro Recente de Check-ins */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Últimas Metas Concluídas</Text>
        {checkIns.length === 0 ? (
          <Text style={styles.emptyFeedText}>
            Nenhuma meta foi concluída ainda. Complete seu primeiro objetivo hoje!
          </Text>
        ) : (
          checkIns
            .slice(-6)
            .reverse()
            .map((item) => (
              <View key={item.id} style={styles.feedItem}>
                <View style={styles.feedInfo}>
                  <Text style={styles.feedTitle}>
                    {habitsMap.get(item.habitId) || 'Meta cumprida'}
                  </Text>
                  <Text style={styles.feedDate}>
                    {item.date} • +{item.xpGained} XP • +{item.hpGained} HP
                  </Text>
                </View>
                <View style={styles.feedBadge}>
                  <Text style={styles.feedBadgeText}>Concluída</Text>
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
  cardHighlight: {
    backgroundColor: '#1e1e2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b3b54',
  },
  cardHighlightTitle: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardHighlightDesc: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#161622',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262638',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#161622',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#232333',
  },
  rpgHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rpgSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayBadgeActive: {
    backgroundColor: '#6366f1',
  },
  dayBadgeInactive: {
    backgroundColor: '#262638',
  },
  dayBadgeCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  attributeBlock: {
    marginBottom: 14,
  },
  attributeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  attributeTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  attributeLevel: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
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
  attributeSub: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  emptyFeedText: {
    color: '#9ca3af',
    fontSize: 13,
    fontStyle: 'italic',
  },
  feedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
  },
  feedInfo: {
    flex: 1,
  },
  feedTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  feedDate: {
    color: '#9ca3af',
    fontSize: 11,
  },
  feedBadge: {
    backgroundColor: '#064e3b44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
  },
  feedBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '600',
  },
});
