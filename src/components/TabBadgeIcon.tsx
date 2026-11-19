import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { RPG_ASSETS } from '../constants/assets';

export type TabType = 'today' | 'quests' | 'dungeon' | 'progress' | 'achievements';

interface TabBadgeIconProps {
  tab: TabType;
  color?: string | any;
  focused: boolean;
  size?: number;
}

export const TabBadgeIcon: React.FC<TabBadgeIconProps> = ({
  tab,
  color,
  focused,
  size = 28,
}) => {
  const activeColor = typeof color === 'string' && color ? color : '#6366f1';

  const getBadgeImage = () => {
    switch (tab) {
      case 'today':
        return RPG_ASSETS.badges.today;
      case 'quests':
        return RPG_ASSETS.badges.quests;
      case 'dungeon':
        return RPG_ASSETS.badges.dungeon;
      case 'progress':
        return RPG_ASSETS.badges.progress;
      case 'achievements':
        return RPG_ASSETS.badges.achievements;
      default:
        return null;
    }
  };

  const imageSource = getBadgeImage();

  return (
    <View
      style={[
        styles.container,
        {
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) * 0.28,
          borderColor: focused ? activeColor : '#334155',
          backgroundColor: focused ? `${activeColor}25` : '#161622',
        },
      ]}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size * 0.24,
              opacity: focused ? 1 : 0.65,
            },
          ]}
          resizeMode="cover"
        />
      ) : tab === 'quests' ? (
        /* Badge heráldico de catálogo e evolução de quests */
        <View
          style={[
            styles.medalBadge,
            {
              width: size,
              height: size,
              borderRadius: size * 0.24,
              borderColor: focused ? '#818cf8' : '#475569',
              backgroundColor: focused ? '#312e81' : '#1e1b4b',
            },
          ]}
        >
          <Text
            style={[
              styles.medalGlyph,
              {
                color: focused ? '#e0e7ff' : '#94a3b8',
                fontSize: size * 0.36,
              },
            ]}
          >
            QST
          </Text>
        </View>
      ) : (
        /* Badge heráldico de medalha / conquista */
        <View
          style={[
            styles.medalBadge,
            {
              width: size,
              height: size,
              borderRadius: size * 0.24,
              borderColor: focused ? '#F59E0B' : '#78716C',
              backgroundColor: focused ? '#78350F' : '#292524',
            },
          ]}
        >
          <Text
            style={[
              styles.medalGlyph,
              {
                color: focused ? '#FCD34D' : '#A8A29E',
                fontSize: size * 0.38,
              },
            ]}
          >
            MED
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#0F172A',
  },
  medalBadge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalGlyph: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
