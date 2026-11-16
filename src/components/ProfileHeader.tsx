import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserProfile, CharacterClassId } from '../types';
import { getRequiredXPForLevel } from '../domain/gamificationEngine';
import {
  getClassDetails,
  getAllClasses,
  canEvolveToClass,
} from '../domain/classProgressionService';
import { ClassIcon } from './rpg/ClassIcon';
import { ClassProgressionModal } from './rpg/ClassProgressionModal';
import { useAppStore } from '../store/useAppStore';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const [classModalVisible, setClassModalVisible] = useState(false);
  const evolveOrSwitchClass = useAppStore((state) => state.evolveOrSwitchClass);

  const xpNeeded = getRequiredXPForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.currentXP / xpNeeded) * 100));
  const hpPercent = Math.min(100, Math.max(0, profile.hp));

  const currentClassDetails = getClassDetails(profile.currentClass);

  const hasNewClassAvailable = getAllClasses().some(
    (c) => !profile.unlockedClasses?.includes(c.id) && canEvolveToClass(c.id, profile)
  );

  const getHpColor = () => {
    if (profile.inSecondChance || profile.hp <= 20) return '#ef4444'; // Vermelho
    if (profile.hp <= 50) return '#f59e0b'; // Amarelo
    return '#10b981'; // Verde
  };

  const handleSelectClass = (classId: CharacterClassId) => {
    evolveOrSwitchClass(classId);
  };

  return (
    <View style={styles.container}>
      {/* Banner da Classe RPG */}
      <View style={styles.classBanner}>
        <View style={styles.classLeft}>
          <ClassIcon classId={profile.currentClass} size={44} />
          <View style={styles.classInfo}>
            <View style={styles.classNameRow}>
              <Text style={[styles.classNameText, { color: currentClassDetails.themeColor }]}>
                {currentClassDetails.name}
              </Text>
              {hasNewClassAvailable && (
                <View style={styles.newClassBadge}>
                  <Text style={styles.newClassBadgeText}>NOVA CLASSE</Text>
                </View>
              )}
            </View>
            <Text style={styles.classTitleText}>{currentClassDetails.title}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setClassModalVisible(true)}
          style={[styles.evolveButton, { borderColor: currentClassDetails.themeColor }]}
        >
          <Text style={[styles.evolveButtonText, { color: currentClassDetails.themeColor }]}>
            CLASSES RPG
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nivel, Streak, Expedicao e Ouro */}
      <View style={styles.topRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>NÍVEL {profile.level}</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>
            {profile.globalStreak} {profile.globalStreak === 1 ? 'dia' : 'dias'} de ofensiva
          </Text>
        </View>

        <View style={styles.goldBadge}>
          <Text style={styles.goldBadgeText}>{profile.goldBalance || 0} G</Text>
        </View>
      </View>

      {/* Barra de XP */}
      <View style={styles.statBlock}>
        <View style={styles.statLabelRow}>
          <Text style={styles.statTitle}>Experiência (XP)</Text>
          <Text style={styles.statValue}>
            {profile.currentXP} / {xpNeeded} XP ({xpPercent}%)
          </Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${xpPercent}%`, backgroundColor: '#6366f1' }]} />
        </View>
      </View>

      {/* Barra de Energia (HP) */}
      <View style={styles.statBlock}>
        <View style={styles.statLabelRow}>
          <Text style={styles.statTitle}>
            Energia (HP){profile.inSecondChance ? ' - SEGUNDA CHANCE ATIVA' : ''}
          </Text>
          <Text style={[styles.statValue, { color: getHpColor() }]}>{profile.hp} / 100 HP</Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${hpPercent}%`, backgroundColor: getHpColor() }]} />
        </View>
      </View>

      {/* Barra de Pontos de Expedicao */}
      <View style={styles.statBlock}>
        <View style={styles.statLabelRow}>
          <Text style={styles.statTitle}>Pontos de Expedição (Cavernas)</Text>
          <Text style={[styles.statValue, { color: '#0ea5e9' }]}>
            {profile.expeditionPoints || 0} pts
          </Text>
        </View>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, (profile.expeditionPoints || 0) * 2)}%`,
                backgroundColor: '#0ea5e9',
              },
            ]}
          />
        </View>
      </View>

      {/* Atributos */}
      <View style={styles.attributesRow}>
        <View style={[styles.attributeCard, { borderColor: '#3b82f6' }]}>
          <Text style={styles.attributeName}>Intelecto</Text>
          <Text style={styles.attributeLevel}>Nvl {profile.attributes.intelecto?.level || 1}</Text>
        </View>

        <View style={[styles.attributeCard, { borderColor: '#f97316' }]}>
          <Text style={styles.attributeName}>Força</Text>
          <Text style={styles.attributeLevel}>Nvl {profile.attributes.forca?.level || 1}</Text>
        </View>

        <View style={[styles.attributeCard, { borderColor: '#8b5cf6' }]}>
          <Text style={styles.attributeName}>Disciplina</Text>
          <Text style={styles.attributeLevel}>Nvl {profile.attributes.disciplina?.level || 1}</Text>
        </View>
      </View>

      {/* Modal de Progressao de Classes */}
      <ClassProgressionModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        profile={profile}
        onSelectClass={handleSelectClass}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2d',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#2e2e42',
  },
  classBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161622',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262638',
  },
  classLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  classInfo: {
    flex: 1,
  },
  classNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  newClassBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newClassBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  classTitleText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },
  evolveButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E1E2D',
  },
  evolveButtonText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  levelBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  streakBadge: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  streakBadgeText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 11,
  },
  goldBadge: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  goldBadgeText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 11,
  },
  statBlock: {
    marginBottom: 10,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#2e2e42',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  attributeCard: {
    flex: 1,
    backgroundColor: '#28283d',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  attributeName: {
    color: '#9ca3af',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  attributeLevel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
