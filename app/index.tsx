import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_BASE_URL } from '@/config/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';


export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const url = `${API_BASE_URL}/api/auth/login`;
      console.log('=== LOGIN DEBUG ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', url);
      console.log('Email:', email);
      
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Store token if needed
        Alert.alert('Success', 'Logged in!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login: ' + (error as Error).message);
    }
  };

  const handleRegister = async () => {
    try {
      const url = `${API_BASE_URL}/api/auth/register`;
      console.log('=== REGISTER DEBUG ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', url);
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        Alert.alert('Success', 'Account created!');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to register: ${(error as Error).message}\n\nURL was: ${API_BASE_URL}`);
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Login</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <ThemedText style={styles.buttonText}>Register</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 24,
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
  button: {
    width: '100%',
    padding: 12,
    marginTop: 16,
    backgroundColor: '#8B2332',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
