import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      setBusy(true);
      await api.login(email.trim(), password); 
      Alert.alert('Success', 'Logged in!');
      router.replace('/home');
    } catch (e: any) {
      console.error('Login error:', e);
      Alert.alert('Error', e?.message || 'Failed to login');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      setBusy(true);
      await api.register(email.trim(), password);
      Alert.alert('Success', 'Account created! Please log in.');
      setEmail('');
      setPassword('');
    } catch (e: any) {
      console.error('Register error:', e);
      Alert.alert('Error', e?.message || 'Failed to register');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Login</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!busy}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!busy}
      />

      <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={handleLogin} disabled={busy}>
        <ThemedText style={styles.buttonText}>Login</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={handleRegister} disabled={busy}>
        <ThemedText style={styles.buttonText}>Register</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { marginBottom: 24 },
  input: {
    width: '100%', padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 8, backgroundColor: '#fff',
  },
  button: { width: '100%', padding: 12, marginTop: 16, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
