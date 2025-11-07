import { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { API_BASE_URL } from '@/config/api';

import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Profile() {
  const [userId, setUserId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [hobby, setHobby] = useState('');
  
  // 从 AsyncStorage 获取 userId
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
          console.log('Profile page userId:', id);
        } else {
          console.warn('No userId found in AsyncStorage');
        }
      } catch (err) {
        console.error('Failed to get userId from storage:', err);
      }
    };

    fetchUserId();
  }, []);

  const handleSave = async () => {
    console.log('--- Saving profile ---');
    console.log('userId:', userId);
    console.log('Profile data:', { name, dateOfBirth, major, year, hobby });
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dateOfBirth,
          major,
          year,
          hobby,
        }),
      });

    const data = await response.json();
    console.log('Profile save response:', data);

    if (response.ok) {
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } else {
      Alert.alert('Error', data.error || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Save profile error:', error);
    Alert.alert('Error', 'Failed to save profile');
  }
};

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Your Profile</ThemedText>

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

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <ThemedText style={styles.buttonText}>Save Profile</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    width: '100%',
    padding: 14,
    marginTop: 12,
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