import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B2332',
        tabBarInactiveTintColor: '#687076',
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Settings',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="collage"
        options={{
          title: 'Collage',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📸</Text>,
        }}
      />
    </Tabs>
  );
}
