import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleLogin = async () => {
  //   try {
  //     const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       // Store token if needed
  //       Alert.alert('Success', 'Logged in!');
  //       router.replace('/home');
  //     } else {
  //       Alert.alert('Error', data.error);
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     Alert.alert('Error', 'Failed to login');
  //   }
  // };
    const handleLogin = async () => {
    try {
      await api.login(email, password); 
      Alert.alert('Success', 'Logged in!');
      router.replace('/(tabs)');       
    } catch (err: any) {
      Alert.alert('Login Failure', err.message || 'invalid password or email！');
    }
  };


  // const handleRegister = async () => {
  //   try {
  //     const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       Alert.alert('Success', 'Account created! You can now login.', [
  //         {
  //           text: 'OK',
  //           onPress: () => {
  //             // Clear the form
  //             setEmail('');
  //             setPassword('');
  //           }
  //         }
  //       ]);
  //     } else {
  //       Alert.alert('Error', data.error);
  //     }
  //   } catch (error) {
  //     console.error('Register error:', error);
  //     Alert.alert('Error', 'Failed to register');
  //   }
  // };
    const handleRegister = async () => {
    try {
      await api.register(email, password); 
      Alert.alert('Register Success', 'Account created! You can now login.');
    } catch (err: any) {
      Alert.alert('Register Failure', err.message || 'email might be used!');
    }
  };

  // return (
  //   <ThemedView style={styles.container}>
  //     <ThemedText type="title" style={styles.title}>Login</ThemedText>
  //     <TextInput
  //       style={styles.input}
  //       placeholder="Email"
  //       value={email}
  //       onChangeText={setEmail}
  //       keyboardType="email-address"
  //       autoCapitalize="none"
  //     />
  //     <TextInput
  //       style={styles.input}
  //       placeholder="Password"
  //       value={password}
  //       onChangeText={setPassword}
  //       secureTextEntry
  //     />
  //     <TouchableOpacity style={styles.button} onPress={handleLogin}>
  //       <ThemedText style={styles.buttonText}>Login</ThemedText>
  //     </TouchableOpacity>
  //     <TouchableOpacity style={styles.button} onPress={handleRegister}>
  //       <ThemedText style={styles.buttonText}>Register</ThemedText>
  //     </TouchableOpacity>
  //   </ThemedView>
  // );
    return (
    <View>
      <TextInput 
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput 
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
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});