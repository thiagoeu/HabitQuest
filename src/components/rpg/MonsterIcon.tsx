import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DungeonDifficulty, Monster } from '../../types';
import { RPG_ASSETS } from '../../constants/assets';

interface MonsterIconProps {
  monster: Monster;
  size?: number;
  showDifficultyBadge?: boolean;
}

export const MonsterIcon: React.FC<MonsterIconProps> = ({
  monster,
  size = 56,
  showDifficultyBadge = true,
}) => {
  const getDifficultyColor = (diff: DungeonDifficulty): string => {
    switch (diff) {
      case 'facil':
        return '#10B981';
      case 'medio':
        return '#F59E0B';
      case 'dificil':
        return '#EF4444';
      case 'chefe':
        return '#A855F7';
      default:
        return '#94A3B8';
    }
  };

  const getDifficultyLabel = (diff: DungeonDifficulty): string => {
    switch (diff) {
      case 'facil':
        return 'FACIL';
      case 'medio':
        return 'MEDIO';
      case 'dificil':
        return 'DIFICIL';
      case 'chefe':
        return 'CHEFE';
      default:
        return 'OUTRO';
    }
  };

  const getMonsterInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 3).toUpperCase();
  };

  const isBoss = monster.id === 'monster-lorde-procrastinador' || monster.difficulty === 'chefe';
  const bossImage = isBoss ? RPG_ASSETS.bossProcrastination : null;

  const diffColor = getDifficultyColor(monster.difficulty);
  const fontSize = Math.max(11, Math.round(size * 0.26));

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            borderColor: diffColor,
            backgroundColor: `${diffColor}18`,
          },
        ]}
      >
        {bossImage ? (
          <Image
            source={bossImage}
            style={{
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) * 0.28,
            }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.innerFrame, { borderColor: `${diffColor}44`, borderRadius: size * 0.24 }]}>
            <Text style={[styles.initialsText, { color: diffColor, fontSize }]}>
              {getMonsterInitials(monster.name)}
            </Text>
            <Text style={[styles.levelTag, { color: '#E2E8F0' }]}>Nv.{monster.level}</Text>
          </View>
        )}
      </View>

      {showDifficultyBadge && (
        <View style={[styles.difficultyBadge, { backgroundColor: diffColor }]}>
          <Text style={styles.difficultyBadgeText}>{getDifficultyLabel(monster.difficulty)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  innerFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelTag: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  difficultyBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
