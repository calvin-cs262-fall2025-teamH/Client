import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profiles */}
      <View style={styles.profileRow}>
        <View style={styles.profileCard}>
          <Text style={styles.profileText}>Your Profile</Text>
        </View>
        <Text style={{ fontSize: 20 }}>❤️</Text>
        <View style={styles.profileCard}>
          <Text style={styles.profileText}>Partner Profile</Text>
        </View>
      </View>

      {/* Main Feature Buttons */}
      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>Prayer List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>To-Do List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>Anniversary Reminders</Text>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity style={styles.settingsBtn}>
        <Text style={styles.settingsText}>⚙️ Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  profileCard: { padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginHorizontal: 8 },
  profileText: { fontSize: 16, fontWeight: '600' },
  featureBtn: {
    width: '100%',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
  },
  featureText: { fontSize: 18, fontWeight: '600' },
  settingsBtn: {
    marginTop: 32,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  settingsText: { fontSize: 16, fontWeight: '500' },
});
