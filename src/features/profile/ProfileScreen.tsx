import { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, ActivityIndicator, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { api } from '@/lib/api';

export function ProfileScreen() {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [hobby, setHobby] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('[Profile] Loading profile...');
      const response = await api.getProfile();
      console.log('[Profile] Profile response:', response);

      if (response.success && response.data) {
        setName(response.data.name || '');
      }
    } catch (error: any) {
      console.error('[Profile] Load profile error:', error);
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setSaving(true);
      console.log('[Profile] Saving profile:', { name });
      const response = await api.updateProfile({ name: name.trim() });
      console.log('[Profile] Save response:', response);

      if (response.success) {
        Alert.alert('Success', 'Profile updated!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('[Profile] Save profile error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B2332" />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText}>← Back</ThemedText>
      </TouchableOpacity>
      <ScrollView>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {name ? `${name}'s Profile` : 'Your Profile'}
          </ThemedText>

          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <ThemedText style={styles.label}>Date of Birth</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />

          <ThemedText style={styles.label}>Major</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your major"
            value={major}
            onChangeText={setMajor}
          />

          <ThemedText style={styles.label}>Year</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Freshman, Sophomore, etc."
            value={year}
            onChangeText={setYear}
          />

          <ThemedText style={styles.label}>Hobby</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your hobbies"
            value={hobby}
            onChangeText={setHobby}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
            <ThemedText style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save Profile'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    padding: 14,
    marginTop: 24,
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
});