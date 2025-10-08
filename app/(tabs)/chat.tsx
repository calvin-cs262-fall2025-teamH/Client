import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function ChatTab() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.placeholder}>
        <ThemedText type="title">💬 Chat</ThemedText>
        <ThemedText style={styles.comingSoon}>Coming Soon</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
  },
  comingSoon: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.6,
  },
});
