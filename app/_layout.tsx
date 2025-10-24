import { Stack } from 'expo-router';
import { PartnerProvider } from './PartnerContext'; 

export default function RootLayout() {
  return (
    <PartnerProvider> 
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Login" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="connect-partner" options={{ title: "Connect Partner" }} />
      </Stack>
    </PartnerProvider>
  );
}
