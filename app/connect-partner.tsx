import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';

export default function ConnectPartner() {
  const [myCode, setMyCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');

  useEffect(() => {
    // Generate a unique code for this user
    const generateCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };
    setMyCode(generateCode());
  }, []);

  const handleConnect = async () => {
    if (!partnerCode) {
      Alert.alert('Error', 'Please enter your partner\'s code');
      return;
    }

    try {
      // TODO: Call backend to connect with partner using partnerCode
      Alert.alert('Success', 'Connected with partner!');
      router.back();
    } catch (error) {
      console.error('Connect partner error:', error);
      Alert.alert('Error', 'Failed to connect with partner');
    }
  };

  const generateQRCode = () => {
    // This would generate a QR code with myCode
    // For now, just show the code
    Alert.alert('Your Code', `Share this code with your partner:\n\n${myCode}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Connect with Partner</ThemedText>

      {/* Display User's Code */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Connection Code</ThemedText>
        <View style={styles.codeBox}>
          <ThemedText style={styles.code}>{myCode}</ThemedText>
        </View>
        <TouchableOpacity style={styles.qrButton} onPress={generateQRCode}>
          <ThemedText style={styles.qrButtonText}>📱 Show QR Code</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.instruction}>
          Share this code or QR code with your partner
        </ThemedText>
      </View>

      {/* Enter Partner's Code */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Enter Partner&apos;s Code</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter code here"
          value={partnerCode}
          onChangeText={setPartnerCode}
          autoCapitalize="characters"
          maxLength={6}
        />
        <TouchableOpacity style={styles.button} onPress={handleConnect}>
          <ThemedText style={styles.buttonText}>Connect</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText}>Back</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  codeBox: {
    padding: 20,
    backgroundColor: '#f8e5e8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B2332',
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  qrButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#8B2332',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});