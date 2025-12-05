import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { usePartner } from '@/contexts/PartnerContext';
import { Ionicons } from '@expo/vector-icons';

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
            } catch (error: unknown) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unmatch');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={20} color="#8B2332" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
          </TouchableOpacity>

          {hasPartner && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/partner-info')}>
              <View style={styles.iconCircle}>
                <Ionicons name="information-circle-outline" size={20} color="#8B2332" />
              </View>
              <Text style={styles.menuText}>Partner Info</Text>
              <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}

          {hasPartner && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/connect-partner')}>
              <View style={styles.iconCircle}>
                <Ionicons name="heart-outline" size={20} color="#8B2332" />
              </View>
              <Text style={styles.menuText}>Start a Relationship</Text>
              <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          {hasPartner && (
            <TouchableOpacity style={styles.dangerMenuItem} onPress={handleUnmatch}>
              <View style={styles.dangerIconCircle}>
                <Ionicons name="heart-dislike-outline" size={20} color="#dc2626" />
              </View>
              <Text style={styles.dangerText}>Unmatch with Partner</Text>
              <Ionicons name="chevron-forward" size={20} color="#dc2626" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dangerMenuItem} onPress={handleDeleteAccount}>
            <View style={styles.dangerIconCircle}>
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </View>
            <Text style={styles.dangerText}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
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
  headerPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8e5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  dangerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    marginBottom: 10,
  },
  dangerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#95a5a6',
  },
});
