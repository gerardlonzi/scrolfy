import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../constants/themeContext';

export default function TabsLayout() {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: `${colors.secondary}18`,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 78,
          borderTopWidth: 1,
          borderTopColor: `${colors.secondary}26`,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          paddingTop: 10,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="focus"
        options={{
          title: 'FOCUS',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'scan' : 'scan-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mastery"
        options={{
          title: 'MASTERY',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

