import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '@/lib/api';
import { Anniversary, CustomAnniversary } from '@/types/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AnniversaryScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Anniversary | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [newDescription, setNewDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for editing relationship start date
  const [editStartDateModalVisible, setEditStartDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAnniversaries();
      if (response.success && response.data) {
        setData(response.data);
        setStartDate(new Date(response.data.relationshipStart));
      } else {
        Alert.alert('Error', response.message || 'Failed to load anniversaries');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load anniversaries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createAnniversary({
        title: newTitle,
        date: newDate.toISOString().split('T')[0],
        description: newDescription
      });

      if (response.success) {
        setModalVisible(false);
        setNewTitle('');
        setNewDescription('');
        setNewDate(new Date());
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to create anniversary');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create anniversary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStartDate = async () => {
    try {
      setSubmitting(true);
      const response = await api.updateRelationshipStartDate(startDate.toISOString().split('T')[0]);

      if (response.success) {
        setEditStartDateModalVisible(false);
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to update start date');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update start date');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Anniversary',
      'Are you sure you want to delete this anniversary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteAnniversary(id);
              if (response.success) {
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysLeft = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B2332" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anniversaries</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#8B2332" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {data && (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Together For</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{data.daysTogether}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
              </View>
              <View style={styles.startDateContainer}>
                <Text style={styles.startDate}>Since {formatDate(data.relationshipStart)}</Text>
                <TouchableOpacity onPress={() => setEditStartDateModalVisible(true)} style={styles.editButton}>
                  <Ionicons name="pencil" size={16} color="#8B2332" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
            <View style={styles.milestoneCard}>
              <View style={styles.milestoneItem}>
                <Ionicons name="calendar-outline" size={20} color="#8B2332" />
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneLabel}>Next 100 Days</Text>
                  <Text style={styles.milestoneDate}>{formatDate(data.nextMilestones.next100Days)}</Text>
                </View>
              </View>
              <View style={styles.separator} />
              <View style={styles.milestoneItem}>
                <Ionicons name="gift-outline" size={20} color="#8B2332" />
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneLabel}>Next Year Anniversary</Text>
                  <Text style={styles.milestoneDate}>
                    {formatDate(data.nextMilestones.nextYearAnniversary)}
                    <Text style={styles.daysLeft}> ({getDaysLeft(data.nextMilestones.nextYearAnniversary)} days left)</Text>
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Special Dates</Text>
            {data.customAnniversaries.length === 0 ? (
              <Text style={styles.emptyText}>No custom anniversaries added yet.</Text>
            ) : (
              data.customAnniversaries.map((item) => (
                <View key={item.id} style={styles.customCard}>
                  <View style={styles.customInfo}>
                    <Text style={styles.customTitle}>{item.title}</Text>
                    <Text style={styles.customDate}>{formatDate(item.date)}</Text>
                    {item.description && <Text style={styles.customDesc}>{item.description}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Anniversary</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. First Date, Engagement"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{newDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewDate(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a note..."
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAdd}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>{submitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Start Date Modal */}
      <Modal
        visible={editStartDateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditStartDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Relationship Start</Text>

            <Text style={styles.inputLabel}>When did it all begin?</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditStartDateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateStartDate}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>{submitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8e5e8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#8B2332' },
  backButton: { padding: 8 },
  addButton: { padding: 8 },
  content: { padding: 20 },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 48, fontWeight: 'bold', color: '#8B2332' },
  statLabel: { fontSize: 16, color: '#666', marginTop: 4 },
  startDateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  startDate: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  editButton: { marginLeft: 8, padding: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 8 },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  milestoneInfo: { marginLeft: 12, flex: 1 },
  milestoneLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  milestoneDate: { fontSize: 14, color: '#666', marginTop: 2 },
  daysLeft: { color: '#8B2332', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 32 },
  customCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  customInfo: { flex: 1 },
  customTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  customDate: { fontSize: 14, color: '#8B2332', marginTop: 4 },
  customDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  deleteButton: { padding: 8 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  dateButtonText: { fontSize: 16, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#8B2332' },
  cancelButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
