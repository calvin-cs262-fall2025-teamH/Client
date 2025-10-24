import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';


interface Prayer {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dateAdded: Date;
  isAnswered: boolean;
  answeredDate?: Date;
}

const CATEGORIES = ['Family', 'Health', 'Work', 'Relationship', 'Spiritual', 'Friends', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'] as const;

export default function PrayerList() {
  const [hasPartner, setHasPartner] = useState(false); // TODO: Get from backend
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('active');

  const pageTitle = hasPartner ? 'Shared Prayer List' : 'Personal Prayer List';

  const addPrayer = () => {
    if (!newPrayer.title.trim()) {
      Alert.alert('Error', 'Please enter a prayer title');
      return;
    }

    const prayer: Prayer = {
      id: Date.now(),
      title: newPrayer.title,
      description: newPrayer.description,
      category: newPrayer.category,
      priority: newPrayer.priority,
      dateAdded: new Date(),
      isAnswered: false,
    };

    setPrayers([prayer, ...prayers]);
    setNewPrayer({ title: '', description: '', category: 'Other', priority: 'medium' });
    setShowAddModal(false);
    Alert.alert('Success', 'Prayer added!');
  };

  const markAsAnswered = (id: number) => {
    Alert.alert(
      'Mark as Answered',
      'Has this prayer been answered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Praise God!',
          onPress: () => {
            setPrayers(prayers.map(p =>
              p.id === id ? { ...p, isAnswered: true, answeredDate: new Date() } : p
            ));
            // Switch to "answered" tab to show the answered prayer
            setFilter('answered');
            setTimeout(() => {
              Alert.alert('🙏 Answered!', 'Your prayer has been marked as answered! Check the "Answered" tab to see it.');
            }, 300);
          },
        },
      ]
    );
  };

  const deletePrayer = (id: number) => {
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setPrayers(prayers.filter(p => p.id !== id)),
        },
      ]
    );
  };

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'active') return !p.isAnswered;
    if (filter === 'answered') return p.isAnswered;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{pageTitle}</ThemedText>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'answered' && styles.filterTabActive]}
          onPress={() => setFilter('answered')}
        >
          <Text style={[styles.filterText, filter === 'answered' && styles.filterTextActive]}>
            Answered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prayer List */}
      <ScrollView style={styles.prayerList}>
        {filteredPrayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {filter === 'answered'
                ? 'No answered prayers yet'
                : 'No prayers yet. Add your first prayer!'}
            </Text>
          </View>
        ) : (
          filteredPrayers.map(prayer => (
            <View key={prayer.id} style={[styles.prayerCard, prayer.isAnswered && styles.prayerCardAnswered]}>
              <View style={styles.prayerHeader}>
                <View style={styles.prayerInfo}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(prayer.priority) }]} />
                  <Text style={styles.categoryText}>{prayer.category}</Text>
                </View>
                {prayer.isAnswered && <Text style={styles.answeredBadge}>✓ Answered</Text>}
              </View>
              <Text style={styles.prayerTitle}>{prayer.title}</Text>
              {prayer.description && <Text style={styles.prayerDescription}>{prayer.description}</Text>}
              <Text style={styles.dateText}>
                Added: {prayer.dateAdded.toLocaleDateString()}
              </Text>
              {prayer.answeredDate && (
                <Text style={styles.answeredDateText}>
                  Answered: {prayer.answeredDate.toLocaleDateString()}
                </Text>
              )}
              <View style={styles.prayerActions}>
                {!prayer.isAnswered ? (
                  <>
                    <TouchableOpacity
                      style={styles.answeredButton}
                      onPress={() => markAsAnswered(prayer.id)}
                    >
                      <Text style={styles.answeredButtonText}>✓ Mark as Answered</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deletePrayer(prayer.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.deleteButtonFull}
                    onPress={() => deletePrayer(prayer.id)}
                  >
                    <Text style={styles.deleteButtonFullText}>🗑️ Delete Prayer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+ Add Prayer</Text>
      </TouchableOpacity>

      {/* Add Prayer Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>Add Prayer</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Prayer title"
              value={newPrayer.title}
              onChangeText={(text) => setNewPrayer({ ...newPrayer, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newPrayer.description}
              onChangeText={(text) => setNewPrayer({ ...newPrayer, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, newPrayer.category === cat && styles.categoryChipActive]}
                  onPress={() => setNewPrayer({ ...newPrayer, category: cat })}
                >
                  <Text style={[styles.categoryChipText, newPrayer.category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map(pri => (
                <TouchableOpacity
                  key={pri}
                  style={[styles.priorityChip, newPrayer.priority === pri && styles.priorityChipActive]}
                  onPress={() => setNewPrayer({ ...newPrayer, priority: pri })}
                >
                  <Text style={[styles.priorityChipText, newPrayer.priority === pri && styles.priorityChipTextActive]}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addPrayer}>
                <Text style={styles.saveButtonText}>Add Prayer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#8B2332',
  },
  title: {
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#8B2332',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  prayerList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  prayerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  prayerCardAnswered: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  answeredBadge: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prayerDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  answeredDateText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  prayerActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  answeredButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answeredButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  deleteButtonFull: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonFullText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#8B2332',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#8B2332',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  priorityChipActive: {
    backgroundColor: '#8B2332',
  },
  priorityChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#8B2332',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
