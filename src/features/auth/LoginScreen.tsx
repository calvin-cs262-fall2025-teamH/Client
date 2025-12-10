import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientHeader}>
        <View style={styles.headerContent}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>CoupleBond</Text>
          <Text style={styles.tagline}>Stay connected with your partner ❤️</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Sign in to continue</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="mail-outline" size={20} color="#8B2332" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#95a5a6"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8B2332" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#95a5a6"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Login</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={20} color="#8B2332" />
          <Text style={styles.registerButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>By continuing, you agree to our Terms & Privacy Policy</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  gradientHeader: {
    backgroundColor: '#8B2332',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
  },
  formCard: {
    margin: 20,
    marginTop: -20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
  },
  loginButton: {
    backgroundColor: '#8B2332',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#95a5a6',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  registerButtonText: {
    color: '#8B2332',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    marginHorizontal: 40,
  },
});
