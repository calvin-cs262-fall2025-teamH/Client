import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import type { PrayerItem } from '@/types/api';

export default function PrayerList() {
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ title: '', content: '' });

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      console.log('[PrayerList] Loading prayers...');
      setLoading(true);
      const response = await api.getPrayers();
      console.log('[PrayerList] Prayers response:', response);
      setPrayers(response.data || []);
    } catch (error: any) {
      console.error('[PrayerList] Prayers error:', error);
      Alert.alert('Error', error.message || 'Failed to load prayers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrayer = async () => {
    if (!newPrayer.title.trim() || !newPrayer.content.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      console.log('[PrayerList] Creating prayer:', { title: newPrayer.title, content: newPrayer.content });
      const response = await api.createPrayer({
        title: newPrayer.title.trim(),
        content: newPrayer.content.trim(),
      });
      console.log('[PrayerList] Create prayer response:', response);

      if (response.data) {
        setPrayers([response.data, ...prayers]);
        setNewPrayer({ title: '', content: '' });
        setShowAddModal(false);
        Alert.alert('Success', 'Prayer added successfully');
      }
    } catch (error: any) {
      console.error('[PrayerList] Add prayer error:', error);
      Alert.alert('Error', error.message || 'Failed to add prayer');
    }
  };

  const handleDeletePrayer = (id: number) => {
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePrayer(id);
              setPrayers(prayers.filter((p) => p.id !== id));
              Alert.alert('Success', 'Prayer deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete prayer');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading prayers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🙏 Prayer List</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.prayerList}>
        {prayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No prayers yet. Add your first prayer!</Text>
          </View>
        ) : (
          prayers.map((prayer) => (
            <View key={prayer.id} style={styles.prayerCard}>
              <View style={styles.prayerHeader}>
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                <TouchableOpacity onPress={() => handleDeletePrayer(prayer.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.prayerContent}>{prayer.content}</Text>
              <Text style={styles.prayerDate}>{formatDate(prayer.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Prayer</Text>
              <TextInput
                style={styles.input}
                placeholder="Prayer Title"
                value={newPrayer.title}
                onChangeText={(text) => setNewPrayer({ ...newPrayer, title: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Prayer Content"
                value={newPrayer.content}
                onChangeText={(text) => setNewPrayer({ ...newPrayer, content: text })}
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setNewPrayer({ title: '', content: '' });
                    setShowAddModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddPrayer}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: '#8B2332' },
  title: { fontSize: 20, fontWeight: '700' },
  addButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#8B2332', borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  prayerList: { flex: 1, padding: 16 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  prayerCard: { marginBottom: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  prayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  prayerTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 20 },
  prayerContent: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  prayerDate: { fontSize: 12, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#8B2332' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
