import { Tabs } from 'expo-router';

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
          title: 'Chat',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>💬</span>,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tabs.Screen
        name="collage"
        options={{
          title: 'Collage',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📸</span>,
        }}
      />
    </Tabs>
  );
}
