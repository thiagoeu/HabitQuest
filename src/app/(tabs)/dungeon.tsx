import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useDungeonStore } from '../../store/useDungeonStore';
import {
  getAllDungeons,
  calculatePlayerCombatPower,
  calculateWinProbability,
  simulateBattle,
} from '../../domain/dungeonCombatService';
import { getClassDetails } from '../../domain/classProgressionService';
import { Dungeon, Monster, BattleResult } from '../../types';
import { MonsterIcon } from '../../components/rpg/MonsterIcon';
import { ClassIcon } from '../../components/rpg/ClassIcon';
import { RPG_ASSETS } from '../../constants/assets';

export default function DungeonScreen() {
  const profile = useAppStore((state) => state.profile);
  const updateProfileAfterBattle = useAppStore((state) => state.updateProfileAfterBattle);

  const selectedDungeonId = useDungeonStore((state) => state.selectedDungeonId);
  const setSelectedDungeon = useDungeonStore((state) => state.setSelectedDungeon);
  const recordBattle = useDungeonStore((state) => state.recordBattle);
  const battleHistory = useDungeonStore((state) => state.battleHistory);
  const defeatedMonsterIds = useDungeonStore((state) => state.defeatedMonsterIds);

  const dungeons = getAllDungeons();
  const currentDungeon = dungeons.find((d) => d.id === selectedDungeonId) || dungeons[0];

  const currentClass = getClassDetails(profile.currentClass);
  const playerCombatPower = calculatePlayerCombatPower(profile);

  // Estado de Combate
  const [activeBattleResult, setActiveBattleResult] = useState<BattleResult | null>(null);
  const [battleModalVisible, setBattleModalVisible] = useState(false);

  const handleStartBattle = (monster: Monster, dungeon: Dungeon) => {
    if (profile.expeditionPoints < monster.expeditionCost) {
      Alert.alert(
        'Energia Insuficiente',
        `Voce possui ${profile.expeditionPoints} pontos de expedicao, mas este monstro requer ${monster.expeditionCost}. Cumpra mais habitos na aba Hoje para recarregar sua energia!`
      );
      return;
    }

    const sim = simulateBattle(profile, monster, dungeon.id);
    if (!sim.canFight || !sim.battleResult) {
      Alert.alert('Combate Indisponivel', sim.reason || 'Nao foi possivel iniciar a batalha.');
      return;
    }

    // Persiste a batalha na store de masmorras
    recordBattle(sim.battleResult);

    // Atualiza saldo de expedicao, ouro e XP no perfil do jogador
    updateProfileAfterBattle(
      sim.battleResult.expeditionPointsSpent,
      sim.battleResult.xpAwarded,
      sim.battleResult.goldAwarded
    );

    setActiveBattleResult(sim.battleResult);
    setBattleModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner Panoramico da Masmorra */}
      <View style={styles.bannerContainer}>
        <Image
          source={RPG_ASSETS.dungeonBanner}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>EXPEDICOES & MASMORRAS</Text>
          <Text style={styles.bannerSubtitle}>
            Transforme sua consistencia diaria em poder de combate
          </Text>
        </View>
      </View>

      {/* Cabecalho de Expedicao */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.heroBox}>
            <ClassIcon classId={profile.currentClass} size={48} showBadge={true} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{currentClass.name}</Text>
              <Text style={styles.heroPower}>Poder de Batalha: {playerCombatPower}</Text>
            </View>
          </View>

          <View style={styles.balancesBox}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>EXPEDICAO</Text>
              <Text style={[styles.balanceValue, { color: '#0EA5E9' }]}>
                {profile.expeditionPoints || 0} pts
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>OURO</Text>
              <Text style={[styles.balanceValue, { color: '#F59E0B' }]}>
                {profile.goldBalance || 0} G
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.expeditionHint}>
          Cumpra seus habitos diarios para gerar pontos de expedicao e enfrentar monstros.
        </Text>
      </View>

      {/* Seletor de Cavernas */}
      <Text style={styles.sectionHeading}>SELECIONE UMA CAVERNA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dungeonTabs}>
        {dungeons.map((dungeon) => {
          const isSelected = dungeon.id === currentDungeon.id;
          const isLocked = profile.level < dungeon.minLevel;

          return (
            <TouchableOpacity
              key={dungeon.id}
              disabled={isLocked}
              onPress={() => setSelectedDungeon(dungeon.id)}
              style={[
                styles.dungeonTabCard,
                isSelected && { borderColor: dungeon.themeColor, backgroundColor: '#202032' },
                isLocked && styles.dungeonTabLocked,
              ]}
            >
              <Text
                style={[
                  styles.dungeonTabName,
                  isSelected && { color: dungeon.themeColor },
                  isLocked && { color: '#64748B' },
                ]}
              >
                {dungeon.name}
              </Text>
              <Text style={styles.dungeonTabLevel}>
                {isLocked ? `Nivel Min. ${dungeon.minLevel}` : 'Disponivel'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detalhes da Caverna e Lista de Monstros */}
      <View style={styles.dungeonHeaderBox}>
        <Text style={[styles.dungeonTitle, { color: currentDungeon.themeColor }]}>
          {currentDungeon.name}
        </Text>
        <Text style={styles.dungeonDesc}>{currentDungeon.description}</Text>
      </View>

      <Text style={styles.sectionHeading}>MONSTROS DISPONIVEIS</Text>
      {currentDungeon.monsters.map((monster) => {
        const isDefeated = defeatedMonsterIds.includes(monster.id);
        const winProbability = calculateWinProbability(
          calculatePlayerCombatPower(profile, monster),
          monster.power,
          currentClass.perk.critChanceBonus || 0
        );

        const getWinProbColor = (p: number) => {
          if (p >= 70) return '#10B981';
          if (p >= 40) return '#F59E0B';
          return '#EF4444';
        };

        const probColor = getWinProbColor(winProbability);
        const hasEnoughEnergy = (profile.expeditionPoints || 0) >= monster.expeditionCost;

        return (
          <View key={monster.id} style={styles.monsterCard}>
            <View style={styles.monsterCardHeader}>
              <MonsterIcon monster={monster} size={50} />
              <View style={styles.monsterCardInfo}>
                <View style={styles.monsterTitleRow}>
                  <Text style={styles.monsterName}>{monster.name}</Text>
                  {isDefeated && <Text style={styles.defeatedTag}>DERROTADO</Text>}
                </View>
                <Text style={styles.monsterSubtitle}>{monster.title}</Text>
                <Text style={styles.monsterLore}>{monster.lore}</Text>
              </View>
            </View>

            {/* Metricas de Combate */}
            <View style={styles.combatStatsRow}>
              <View style={styles.statMetric}>
                <Text style={styles.statMetricLabel}>Poder:</Text>
                <Text style={styles.statMetricValue}>{monster.power}</Text>
              </View>

              <View style={styles.statMetric}>
                <Text style={styles.statMetricLabel}>Custo:</Text>
                <Text style={styles.statMetricValue}>{monster.expeditionCost} pts</Text>
              </View>

              <View style={styles.statMetric}>
                <Text style={styles.statMetricLabel}>Recompensa:</Text>
                <Text style={styles.statMetricValue}>
                  +{monster.rewards.xp} XP | +{monster.rewards.gold} G
                </Text>
              </View>
            </View>

            {/* Chance de Vitoria e Acao */}
            <View style={styles.actionRow}>
              <View style={styles.probBox}>
                <Text style={styles.probLabel}>Chance de Vitoria:</Text>
                <Text style={[styles.probValue, { color: probColor }]}>{winProbability}%</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleStartBattle(monster, currentDungeon)}
                style={[
                  styles.battleButton,
                  !hasEnoughEnergy && styles.battleButtonDisabled,
                ]}
              >
                <Text style={styles.battleButtonText}>
                  {hasEnoughEnergy ? 'BATALHAR' : 'SEM ENERGIA'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Historico Recente de Batalhas */}
      <View style={styles.historySection}>
        <Text style={styles.sectionHeading}>HISTORICO RECENTE DE EXPEDICOES</Text>
        {battleHistory.length === 0 ? (
          <Text style={styles.emptyHistoryText}>
            Nenhuma expedicao realizada ainda. Reuna energia e enfrente seu primeiro monstro!
          </Text>
        ) : (
          battleHistory.slice(0, 5).map((battle) => (
            <View
              key={battle.id}
              style={[
                styles.historyCard,
                battle.victory ? styles.historyVictory : styles.historyDefeat,
              ]}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyMonsterName}>{battle.monster.name}</Text>
                <Text style={styles.historyDate}>
                  {battle.date} • Chance: {battle.winProbability}% (Rolagem: {battle.roll})
                </Text>
              </View>
              <View style={styles.historyResultBadge}>
                <Text
                  style={[
                    styles.historyResultText,
                    { color: battle.victory ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {battle.victory
                    ? `VITORIA (+${battle.xpAwarded} XP, +${battle.goldAwarded} G)`
                    : 'DERROTA'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Modal Interativo de Batalha */}
      <Modal
        visible={battleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBattleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.battleModalBox}>
            {activeBattleResult && (
              <>
                <Text
                  style={[
                    styles.battleResultHeading,
                    { color: activeBattleResult.victory ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {activeBattleResult.victory ? 'VITORIA ALCANCADA!' : 'RECUA ESTRATEGICA!'}
                </Text>

                <Text style={styles.battleMonsterHeading}>
                  Enfrentando {activeBattleResult.monster.name}
                </Text>

                <View style={styles.combatLogBox}>
                  {activeBattleResult.combatLog.map((turn) => (
                    <View key={turn.turnNumber} style={styles.logTurn}>
                      <Text style={styles.turnActor}>
                        [Turno {turn.turnNumber}] {turn.actor === 'player' ? 'Voce' : 'Monstro'}:
                      </Text>
                      <Text style={styles.turnDesc}>{turn.actionDescription}</Text>
                    </View>
                  ))}
                </View>

                {activeBattleResult.victory ? (
                  <View style={styles.rewardBox}>
                    <Text style={styles.rewardTitle}>RECOMPENSAS CONQUISTADAS:</Text>
                    <Text style={styles.rewardText}>
                      +{activeBattleResult.xpAwarded} Pontos de Experiencia (XP)
                    </Text>
                    <Text style={styles.rewardText}>
                      +{activeBattleResult.goldAwarded} Moedas de Ouro (G)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.defeatAdviceBox}>
                    <Text style={styles.defeatAdviceTitle}>DICA DE TREINO:</Text>
                    <Text style={styles.defeatAdviceText}>
                      Monstros mais fortes exigem mais preparo. Conclua habitos de Forca e
                      Disciplina na rotina para aumentar seu poder e elevar sua probabilidade de
                      sucesso!
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setBattleModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>CONTINUAR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C12',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B3B54',
    position: 'relative',
    backgroundColor: '#1E1E2D',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 12, 18, 0.55)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bannerSubtitle: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#1E1E2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E2E42',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroInfo: {
    justifyContent: 'center',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  heroPower: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  balancesBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceItem: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  expeditionHint: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
  },
  sectionHeading: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginVertical: 10,
  },
  dungeonTabs: {
    marginBottom: 12,
  },
  dungeonTabCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#262638',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
  },
  dungeonTabLocked: {
    opacity: 0.5,
  },
  dungeonTabName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dungeonTabLevel: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
  },
  dungeonHeaderBox: {
    backgroundColor: '#161622',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#232333',
  },
  dungeonTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  dungeonDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  monsterCard: {
    backgroundColor: '#1E1E2D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E2E42',
  },
  monsterCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  monsterCardInfo: {
    flex: 1,
  },
  monsterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monsterName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  defeatedTag: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  monsterSubtitle: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 1,
  },
  monsterLore: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  combatStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161622',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  statMetric: {
    alignItems: 'center',
  },
  statMetricLabel: {
    color: '#9CA3AF',
    fontSize: 9,
  },
  statMetricValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  probBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  probLabel: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  probValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  battleButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  battleButtonDisabled: {
    backgroundColor: '#374151',
  },
  battleButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  historySection: {
    marginTop: 12,
  },
  emptyHistoryText: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: '#161622',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  historyVictory: {
    borderColor: '#064E3B',
  },
  historyDefeat: {
    borderColor: '#7F1D1D',
  },
  historyInfo: {
    marginBottom: 4,
  },
  historyMonsterName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyDate: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  historyResultBadge: {
    alignItems: 'flex-start',
  },
  historyResultText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  battleModalBox: {
    backgroundColor: '#161622',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262638',
  },
  battleResultHeading: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  battleMonsterHeading: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  combatLogBox: {
    backgroundColor: '#1E1E2D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  logTurn: {
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
    paddingBottom: 6,
  },
  turnActor: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '700',
  },
  turnDesc: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  rewardBox: {
    backgroundColor: '#064E3B44',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  rewardTitle: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 1,
  },
  defeatAdviceBox: {
    backgroundColor: '#7F1D1D33',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  defeatAdviceTitle: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  defeatAdviceText: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
