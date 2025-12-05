import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, SafeAreaView, ScrollView, Text } from 'react-native';
import { usePartner } from '@/contexts/PartnerContext';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={styles.safeArea}>
      {/* Modern gradient header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Partner</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B2332" />
          </View>
        )}

        {/* Your Code Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="qr-code" size={24} color="#8B2332" />
            <Text style={styles.cardTitle}>Your Connection Code</Text>
          </View>
          {myCode ? (
            <>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{myCode}</Text>
              </View>
              <TouchableOpacity style={styles.showCodeButton} onPress={showMyCode} activeOpacity={0.8}>
                <Ionicons name="eye-outline" size={20} color="#8B2332" />
                <Text style={styles.showCodeButtonText}>Show Full Code</Text>
              </TouchableOpacity>
              <Text style={styles.instruction}>
                Share this code with your partner to connect
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyStateText}>
                Generate a code to share with your partner
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateCode} disabled={loading} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Generate Code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Enter Partner Code Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="link" size={24} color="#8B2332" />
            <Text style={styles.cardTitle}>Enter Partner's Code</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Ask your partner for their code and enter it below
          </Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXXX"
            placeholderTextColor="#bdc3c7"
            value={partnerCodeInput}
            onChangeText={setPartnerCodeInput}
            autoCapitalize="characters"
            maxLength={6}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.primaryButton, !partnerCodeInput.trim() && styles.primaryButtonDisabled]}
            onPress={handleConnect}
            disabled={loading || !partnerCodeInput.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#8B2332',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  codeBox: {
    padding: 24,
    backgroundColor: '#f8e5e8',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#8B2332',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 16,
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#8B2332',
  },
  showCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  showCodeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B2332',
  },
  instruction: {
    fontSize: 13,
    textAlign: 'center',
    color: '#7f8c8d',
    lineHeight: 18,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#2c3e50',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: '#8B2332',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#95a5a6',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 20,
  },
});
