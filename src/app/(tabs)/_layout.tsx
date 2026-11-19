import React from 'react';
import { Tabs } from 'expo-router';
import { TabBadgeIcon } from '../../components/TabBadgeIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#12121a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#12121a',
          borderTopColor: '#232333',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          headerTitle: 'HabitQuest',
          tabBarIcon: ({ color, focused }) => (
            <TabBadgeIcon tab="today" color={color} focused={focused} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          headerTitle: 'Quests e Evolução',
          tabBarIcon: ({ color, focused }) => (
            <TabBadgeIcon tab="quests" color={color} focused={focused} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="dungeon"
        options={{
          title: 'Cavernas',
          headerTitle: 'Masmorras e Batalhas RPG',
          tabBarIcon: ({ color, focused }) => (
            <TabBadgeIcon tab="dungeon" color={color} focused={focused} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Status',
          headerTitle: 'Status e Superação',
          tabBarIcon: ({ color, focused }) => (
            <TabBadgeIcon tab="progress" color={color} focused={focused} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Medalhas',
          headerTitle: 'Galeria de Medalhas',
          tabBarIcon: ({ color, focused }) => (
            <TabBadgeIcon tab="achievements" color={color} focused={focused} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
