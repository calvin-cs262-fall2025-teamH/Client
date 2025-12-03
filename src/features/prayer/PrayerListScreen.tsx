import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import type { PrayerItem } from '@/types/api';

export function PrayerListScreen() {
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ title: '', content: '' });
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useFocusEffect(
    useCallback(() => {
      loadPrayers();
    }, [])
  );

  const loadPrayers = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      console.log('[PrayerList] Loading prayers...');
      if (!silent) {
        setLoading(true);
      }
      const response = await api.getPrayers();
      console.log('[PrayerList] Prayers response:', response);
      setPrayers(response.data || []);
    } catch (error: unknown) {
      console.error('[PrayerList] Prayers error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load prayers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPrayers({ silent: true });
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
        const created = response.data;
        setPrayers((prev) => [created, ...prev]);
        setNewPrayer({ title: '', content: '' });
        setShowAddModal(false);
        Alert.alert('Success', 'Prayer added successfully');
      }
    } catch (error: unknown) {
      console.error('[PrayerList] Add prayer error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add prayer');
    }
  };

  const handleTogglePrayer = async (prayer: PrayerItem) => {
    try {
      const response = await api.togglePrayerAnswered(prayer.id);
      const updated = response.data;
      if (updated) {
        setPrayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        Alert.alert('Updated', `Marked as ${updated.isAnswered ? 'answered' : 'unanswered'}.`);
      }
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update prayer status');
    }
  };

  const handleEditPrayer = (prayer: PrayerItem) => {
    setEditingPrayer(prayer);
    setEditForm({ title: prayer.title, content: prayer.content });
    setShowEditModal(true);
  };

  const handleUpdatePrayer = async () => {
    if (!editingPrayer) return;

    if (!editForm.title.trim() || !editForm.content.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      console.log('[PrayerList] Updating prayer:', editingPrayer.id, editForm);
      const response = await api.updatePrayer(editingPrayer.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
      });
      console.log('[PrayerList] Update prayer response:', response);

      if (response.data) {
        const updated = response.data;
        setPrayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setShowEditModal(false);
        setEditingPrayer(null);
        setEditForm({ title: '', content: '' });
        Alert.alert('Success', 'Prayer updated successfully');
      }
    } catch (error: unknown) {
      console.error('[PrayerList] Update prayer error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update prayer');
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
            } catch (error: unknown) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete prayer');
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

        <ScrollView
          style={styles.prayerList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B2332" />}>
          {prayers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No prayers yet. Add your first prayer!</Text>
            </View>
          ) : (
            prayers.map((prayer) => (
              <View key={prayer.id} style={styles.prayerCard}>
                <View style={styles.prayerHeader}>
                  <Text style={styles.prayerTitle}>{prayer.title}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEditPrayer(prayer)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePrayer(prayer.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.prayerContent}>{prayer.content}</Text>
                <View style={styles.prayerFooter}>
                  <View style={[styles.statusBadge, prayer.isAnswered ? styles.statusBadgeAnswered : styles.statusBadgeOpen]}>
                    <Text style={[styles.statusText, prayer.isAnswered && styles.statusTextAnswered]}>
                      {prayer.isAnswered ? 'Answered' : 'Pending'}
                    </Text>
                  </View>
                  <Text style={styles.prayerDate}>{formatDate(prayer.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleButton, prayer.isAnswered ? styles.toggleButtonUndo : styles.toggleButtonComplete]}
                  onPress={() => handleTogglePrayer(prayer)}
                >
                  <Text style={styles.toggleButtonText}>
                    {prayer.isAnswered ? 'Mark as Unread' : 'Mark as Read'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
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

        <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Prayer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Prayer Title"
                  value={editForm.title}
                  onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Prayer Content"
                  value={editForm.content}
                  onChangeText={(text) => setEditForm({ ...editForm, content: text })}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditForm({ title: '', content: '' });
                      setEditingPrayer(null);
                      setShowEditModal(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdatePrayer}>
                    <Text style={styles.saveButtonText}>Update</Text>
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
  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: { padding: 4 },
  editButtonText: { fontSize: 20 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 20 },
  prayerContent: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  prayerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  prayerDate: { fontSize: 12, color: '#9ca3af' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  statusBadgeOpen: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  statusBadgeAnswered: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#b91c1c' },
  statusTextAnswered: { color: '#166534' },
  toggleButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleButtonComplete: { backgroundColor: '#8B2332' },
  toggleButtonUndo: { backgroundColor: '#6b7280' },
  toggleButtonText: { color: '#fff', fontWeight: '600' },
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
