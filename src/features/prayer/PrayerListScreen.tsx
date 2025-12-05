import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B2332" />
          <Text style={styles.loadingText}>Loading prayers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modern gradient header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer List</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B2332" />}>
        {prayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="prism-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No prayers yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first prayer</Text>
          </View>
        ) : (
          prayers.map((prayer) => (
            <View key={prayer.id} style={styles.prayerCard}>
              <View style={styles.prayerHeader}>
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEditPrayer(prayer)} style={styles.iconButton}>
                    <Ionicons name="pencil" size={20} color="#7f8c8d" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePrayer(prayer.id)} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.prayerContent}>{prayer.content}</Text>
              <View style={styles.prayerFooter}>
                <View style={[styles.statusBadge, prayer.isAnswered ? styles.statusBadgeAnswered : styles.statusBadgeOpen]}>
                  <Ionicons
                    name={prayer.isAnswered ? "checkmark-circle" : "time-outline"}
                    size={14}
                    color={prayer.isAnswered ? "#27ae60" : "#f39c12"}
                  />
                  <Text style={[styles.statusText, prayer.isAnswered && styles.statusTextAnswered]}>
                    {prayer.isAnswered ? 'Answered' : 'Pending'}
                  </Text>
                </View>
                <Text style={styles.prayerDate}>{formatDate(prayer.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, prayer.isAnswered ? styles.toggleButtonUndo : styles.toggleButtonComplete]}
                onPress={() => handleTogglePrayer(prayer)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={prayer.isAnswered ? "arrow-undo" : "checkmark"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.toggleButtonText}>
                  {prayer.isAnswered ? 'Mark as Pending' : 'Mark as Answered'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d'
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
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
  prayerCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  prayerContent: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 16,
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerDate: {
    fontSize: 13,
    color: '#95a5a6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeOpen: {
    backgroundColor: '#fff3cd',
  },
  statusBadgeAnswered: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
  statusTextAnswered: {
    color: '#155724',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleButtonComplete: {
    backgroundColor: '#27ae60',
  },
  toggleButtonUndo: {
    backgroundColor: '#95a5a6',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8B2332',
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
