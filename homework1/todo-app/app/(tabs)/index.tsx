import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import TodoList from '@/components/todo-list';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 To-Do App</Text>
        <Text style={styles.subtitle}>Stay organized and productive!</Text>
      </View>
      <View style={styles.content}>
        <TodoList />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
