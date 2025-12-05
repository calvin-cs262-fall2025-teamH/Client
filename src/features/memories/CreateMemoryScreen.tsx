import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function CreateMemoryScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setLoading(true);
      await api.createActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        date: new Date(date).toISOString(),
      });

      Alert.alert('Success', 'Memory created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Memory</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="star" size={16} color="#8B2332" />
              <Text style={styles.label}>Title *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., First Date, Anniversary Dinner"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar" size={16} color="#8B2332" />
              <Text style={styles.label}>Date *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#95a5a6"
            />
            <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="location" size={16} color="#8B2332" />
              <Text style={styles.label}>Location</Text>
            </View>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Central Park, Paris"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text" size={16} color="#8B2332" />
              <Text style={styles.label}>Description</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell the story of this memory..."
              placeholderTextColor="#95a5a6"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Memory'}
            </Text>
          </TouchableOpacity>

          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#7f8c8d" />
            <Text style={styles.note}>
              You can add photos to this memory after creating it.
            </Text>
          </View>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 6,
    marginLeft: 4,
  },
  createButton: {
    backgroundColor: '#8B2332',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  note: {
    flex: 1,
    fontSize: 13,
    color: '#7f8c8d',
  },
});
