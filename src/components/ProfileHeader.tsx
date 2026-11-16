import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../types';
import { getRequiredXPForLevel } from '../domain/gamificationEngine';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const xpNeeded = getRequiredXPForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.currentXP / xpNeeded) * 100));
  const hpPercent = Math.min(100, Math.max(0, profile.hp));

  const getHpColor = () => {
    if (profile.inSecondChance || profile.hp <= 20) return '#ef4444'; // Vermelho
    if (profile.hp <= 50) return '#f59e0b'; // Amarelo
    return '#10b981'; // Verde
  };

  return (
    <View style={styles.container}>
      {/* Nivel e Streak Global */}
      <View style={styles.topRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>NÍVEL {profile.level}</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>
            {profile.globalStreak} {profile.globalStreak === 1 ? 'dia' : 'dias'} de ofensiva
          </Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  streakBadge: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  streakBadgeText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 12,
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
  attributeIcon: {
    fontSize: 16,
    marginBottom: 2,
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
