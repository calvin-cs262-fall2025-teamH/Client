import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { usePartner } from '@/contexts/PartnerContext';

export function SettingsScreen() {
  const { hasPartner, unmatchPartner } = usePartner();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleUnmatch = async () => {
    Alert.alert(
      'Unmatch Partner',
      'Are you sure you want to unmatch with your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatchPartner();
              Alert.alert('Success', 'You have been unmatched from your partner.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unmatch');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>⚙️ Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          {hasPartner && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/partner-info')}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuText}>Partner Info</Text>
            </TouchableOpacity>
          )}

          {hasPartner && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/connect-partner')}>
              <Text style={styles.menuIcon}>💑</Text>
              <Text style={styles.menuText}>Start a Relationship</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          {hasPartner && (
            <TouchableOpacity style={styles.dangerMenuItem} onPress={handleUnmatch}>
              <Text style={styles.menuIcon}>💔</Text>
              <Text style={styles.dangerText}>Unmatch with Partner</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dangerMenuItem} onPress={handleDeleteAccount}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CoupleBond v1.0</Text>
          <Text style={styles.footerSubtext}>Stay connected with your partner ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8e5e8',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B2332',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B2332',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8e5e8',
    marginBottom: 8,
  },
  dangerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B2332',
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
