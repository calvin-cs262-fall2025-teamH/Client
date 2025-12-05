import { Stack } from 'expo-router';
import { PartnerProvider } from '../contexts/PartnerContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PartnerProvider> 
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Login" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="connect-partner" options={{ title: "Connect Partner" }} />
          <Stack.Screen name="background-settings" options={{ title: "Background Settings", headerShown: true }} />
        </Stack>
      </PartnerProvider>
    </ThemeProvider>
  );
}
