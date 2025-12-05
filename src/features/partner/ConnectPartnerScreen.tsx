import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { usePartner } from '@/contexts/PartnerContext';

export function ConnectPartnerScreen() {
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { myCode, generateCode, connectWithCode, hasPartner, partner } = usePartner();

  useEffect(() => {
    if (hasPartner) {
      Alert.alert(
        'Already Connected',
        `You are already connected with ${partner?.name || partner?.email}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [hasPartner, partner]);

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      await generateCode();
      Alert.alert('Code Generated', 'Your code has been generated. Share it with your partner!');
    } catch (error: unknown) {
      console.error('Generate code error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!partnerCodeInput.trim()) {
      Alert.alert('Error', 'Please enter your partner\'s code');
      return;
    }

    try {
      setLoading(true);
      await connectWithCode(partnerCodeInput.trim().toUpperCase());
      Alert.alert(
        'Success',
        'Connected with partner successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: unknown) {
      console.error('Connect partner error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to connect with partner');
    } finally {
      setLoading(false);
    }
  };

  const showMyCode = () => {
    if (myCode) {
      Alert.alert('Your Code', `Share this code with your partner:\n\n${myCode}`);
    } else {
      Alert.alert('No Code', 'Please generate a code first');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText}>← Back</ThemedText>
      </TouchableOpacity>
      <ThemedText type="title" style={styles.title}>Connect with Partner</ThemedText>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B2332" />
        </View>
      )}

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Connection Code</ThemedText>
        {myCode ? (
          <>
            <View style={styles.codeBox}>
              <ThemedText style={styles.code}>{myCode}</ThemedText>
            </View>
            <TouchableOpacity style={styles.qrButton} onPress={showMyCode}>
              <ThemedText style={styles.qrButtonText}>📱 Show Code</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.instruction}>
              Share this code with your partner
            </ThemedText>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleGenerateCode} disabled={loading}>
            <ThemedText style={styles.buttonText}>Generate Code</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Enter Partner&apos;s Code</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter code here"
          value={partnerCodeInput}
          onChangeText={setPartnerCodeInput}
          autoCapitalize="characters"
          maxLength={6}
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={handleConnect} disabled={loading}>
          <ThemedText style={styles.buttonText}>Connect</ThemedText>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 3,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B2332',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
