import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <View style={[styles.card, isUnlocked ? styles.cardUnlocked : styles.cardLocked]}>
      {/* Icone / Emblema da Conquista */}
      <View style={[styles.badgeIconBox, isUnlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked]}>
        <Text style={[styles.badgeIconText, isUnlocked && styles.badgeIconTextUnlocked]}>
          {isUnlocked ? '[Trofeu]' : '[Cadeado]'}
        </Text>
      </View>

      {/* Detalhes */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isUnlocked ? styles.titleUnlocked : styles.titleLocked]}>
            {achievement.title}
          </Text>
          <View style={[styles.tag, isUnlocked ? styles.tagUnlocked : styles.tagLocked]}>
            <Text style={[styles.tagText, isUnlocked ? styles.tagTextUnlocked : styles.tagTextLocked]}>
              {isUnlocked ? 'CONQUISTADA' : 'BLOQUEADA'}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{achievement.description}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.requirementText}>Requisito: {achievement.requirementText}</Text>
          {isUnlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>Em: {formatDate(achievement.unlockedAt)}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardUnlocked: {
    backgroundColor: '#1e1e2d',
    borderColor: '#6366f1',
  },
  cardLocked: {
    backgroundColor: '#161622',
    borderColor: '#262638',
    opacity: 0.75,
  },
  badgeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  badgeIconUnlocked: {
    backgroundColor: '#312e81',
    borderColor: '#818cf8',
  },
  badgeIconLocked: {
    backgroundColor: '#262638',
    borderColor: '#374151',
  },
  badgeIconText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
  },
  badgeIconTextUnlocked: {
    color: '#fbbf24',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  titleUnlocked: {
    color: '#ffffff',
  },
  titleLocked: {
    color: '#9ca3af',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagUnlocked: {
    backgroundColor: '#064e3b',
  },
  tagLocked: {
    backgroundColor: '#262638',
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  tagTextUnlocked: {
    color: '#34d399',
  },
  tagTextLocked: {
    color: '#9ca3af',
  },
  description: {
    color: '#d1d5db',
    fontSize: 12,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requirementText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600',
  },
  unlockedDate: {
    color: '#9ca3af',
    fontSize: 10,
  },
});
