import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CharacterClassId } from '../../types';
import { getClassDetails } from '../../domain/classProgressionService';

interface ClassIconProps {
  classId: CharacterClassId;
  size?: number;
  showBadge?: boolean;
  isLocked?: boolean;
}

export const ClassIcon: React.FC<ClassIconProps> = ({
  classId,
  size = 48,
  showBadge = false,
  isLocked = false,
}) => {
  const classDetails = getClassDetails(classId);
  const themeColor = isLocked ? '#64748B' : classDetails.themeColor;

  const getClassGlyph = (id: CharacterClassId): string => {
    switch (id) {
      case 'aprendiz':
        return 'APR';
      case 'monge':
        return 'MNG';
      case 'cavaleiro':
        return 'CVL';
      case 'sabio':
        return 'SAB';
      case 'arqueiro':
        return 'ARQ';
      case 'exorcista':
        return 'EXO';
      default:
        return 'RPG';
    }
  };

  const getSubTitle = (id: CharacterClassId): string => {
    switch (id) {
      case 'aprendiz':
        return 'INICIANTE';
      case 'monge':
        return 'DISCIPLINA';
      case 'cavaleiro':
        return 'FORCA';
      case 'sabio':
        return 'INTELECTO';
      case 'arqueiro':
        return 'PRECISAO';
      case 'exorcista':
        return 'BANIDOR';
      default:
        return '';
    }
  };

  const boxStyle = {
    width: size,
    height: size,
    borderRadius: size * 0.28,
    backgroundColor: isLocked ? '#1E293B' : `${themeColor}22`,
    borderColor: isLocked ? '#334155' : themeColor,
  };

  const fontSize = Math.max(10, Math.round(size * 0.28));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, boxStyle]}>
        {/* Anel ornamental interno */}
        <View
          style={[
            styles.innerRing,
            {
              borderColor: `${themeColor}55`,
              borderRadius: size * 0.22,
            },
          ]}
        >
          <Text style={[styles.glyphText, { color: themeColor, fontSize }]}>
            {getClassGlyph(classId)}
          </Text>
        </View>
      </View>

      {showBadge && (
        <View style={[styles.badge, { backgroundColor: isLocked ? '#334155' : themeColor }]}>
          <Text style={styles.badgeText}>{isLocked ? 'BLOQUEADA' : getSubTitle(classId)}</Text>
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
  innerRing: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
