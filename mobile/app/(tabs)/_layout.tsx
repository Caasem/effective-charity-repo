import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: color.bgElevated,
          borderTopColor: color.border,
          borderTopWidth: StyleSheetHairline(),
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color: c, size }) => <Ionicons name="flash" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color: c, size }) => <Ionicons name="location" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="initiatives"
        options={{
          title: 'Initiatives',
          tabBarIcon: ({ color: c, size }) => <Ionicons name="pulse" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="charities"
        options={{
          title: 'Charities',
          tabBarIcon: ({ color: c, size }) => <Ionicons name="business" size={size} color={c} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color: c, size }) => <Ionicons name="person" size={size} color={c} />,
        }}
      />
    </Tabs>
  );
}

function StyleSheetHairline() {
  return 0.5;
}
