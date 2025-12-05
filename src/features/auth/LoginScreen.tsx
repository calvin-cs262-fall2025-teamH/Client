import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View, Text } from 'react-native';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await api.login(email, password);
      await new Promise(resolve => setTimeout(resolve, 100));
      Alert.alert('Success', 'Logged in!');
      router.replace('/(tabs)');
    } catch (err: unknown) {
      Alert.alert('Login Failure', err instanceof Error ? err.message : 'invalid password or email！');
    }
  };

  const handleRegister = async () => {
    try {
      await api.register(email, password);
      Alert.alert('Register Success', 'Account created! You can now login.');
    } catch (err: unknown) {
      Alert.alert('Register Failure', err instanceof Error ? err.message : 'email might be used!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>CoupleBond</Text>
          <Text style={styles.subtitle}>Login / Sign Up</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8e5e8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appNameContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B2332',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
