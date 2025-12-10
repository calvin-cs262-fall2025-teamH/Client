import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { DevotionalPlan } from '@/types/api';
import { Colors } from '@/constants/theme';

type Mode = 'couple' | 'year';

export function DevotionalScreen() {
  const [plans, setPlans] = useState<DevotionalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State
  const [mode, setMode] = useState<Mode>('couple');
  const [selectedPlan, setSelectedPlan] = useState<DevotionalPlan | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Custom Plan Form State
  const [startBook, setStartBook] = useState('Genesis');
  const [startChapter, setStartChapter] = useState('1');
  const [endBook, setEndBook] = useState('Genesis');
  const [endChapter, setEndChapter] = useState('10');
  const [chaptersPerDay, setChaptersPerDay] = useState('1');

  const loadDevotionals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getDevotionals(mode);
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to load devotionals', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    loadDevotionals();
  }, [loadDevotionals]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDevotionals();
  };

  const handleAppendCustomPlan = async () => {
    try {
      await api.appendCustomPlan({
        start_book: startBook,
        start_chapter: parseInt(startChapter),
        end_book: endBook,
        end_chapter: parseInt(endChapter),
        chapters_per_day: parseInt(chaptersPerDay),
      });
      setShowCustomModal(false);
      Alert.alert('Success', 'Chapters added to your plan!');
      loadDevotionals();
    } catch (error) {
      Alert.alert('Error', 'Failed to add chapters');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedItems.size} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCustomPlanItems(Array.from(selectedItems));
              setSelectedItems(new Set());
              setSelectionMode(false);
              loadDevotionals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete items');
            }
          },
        },
      ]
    );
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    
    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleToggle = async (id: number, isCustom: boolean = false) => {
    if (selectionMode) {
      toggleSelection(id);
      return;
    }

    // Optimistic update
    setPlans(current =>
      current.map(p =>
        p.id === id ? { ...p, is_completed: !p.is_completed } : p
      )
    );

    try {
      const response = isCustom 
        ? await api.toggleCustomDevotional(id)
        : await api.toggleDevotional(id);

      if (!response.success) {
        // Revert if failed
        setPlans(current =>
          current.map(p =>
            p.id === id ? { ...p, is_completed: !p.is_completed } : p
          )
        );
      }
    } catch (error) {
      // Revert if error
      setPlans(current =>
        current.map(p =>
          p.id === id ? { ...p, is_completed: !p.is_completed } : p
        )
      );
    }
  };

  const completedCount = plans.filter(p => p.is_completed).length;
  const progress = plans.length > 0 ? completedCount / plans.length : 0;

  const renderItem = ({ item }: { item: DevotionalPlan }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(item.id);
          } else {
            setSelectedPlan(item);
          }
        }}
        onLongPress={() => {
          if (mode === 'year') {
            setSelectionMode(true);
            toggleSelection(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleToggle(item.id, item.is_custom)}
          disabled={selectionMode}
        >
          {selectionMode ? (
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? Colors.light.tint : '#999'}
            />
          ) : (
            <Ionicons
              name={item.is_completed ? 'checkbox' : 'square-outline'}
              size={24}
              color={item.is_completed ? Colors.light.tint : '#999'}
            />
          )}
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, item.is_completed && !selectionMode && styles.completedText]}>
            Day {item.day_number}: {item.title}
          </Text>
          <Text style={styles.cardReference}>{item.reference}</Text>
        </View>

        {!selectionMode && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Bread</Text>
        {mode === 'year' && selectionMode ? (
          <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete ({selectedItems.size})</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Mode Selection Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'couple' && styles.activeTab]}
          onPress={() => {
            setMode('couple');
            setSelectionMode(false);
          }}
        >
          <Text style={[styles.tabText, mode === 'couple' && styles.activeTabText]}>Couples</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'year' && styles.activeTab]}
          onPress={() => setMode('year')}
        >
          <Text style={[styles.tabText, mode === 'year' && styles.activeTabText]}>Bible in Year</Text>
        </TouchableOpacity>
      </View>

      {mode === 'year' && !selectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.addChaptersButton}
            onPress={() => setShowCustomModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addChaptersText}>Add Chapters</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>Long press items to manage</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>Your Journey</Text>
          <Text style={styles.progressValue}>{completedCount}/{plans.length} Days</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 20 }} />
      ) : mode === 'year' && plans.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>Start Your Reading Plan</Text>
          <Text style={styles.emptyStateSubtext}>Add chapters to build your custom reading list.</Text>
          <TouchableOpacity style={styles.setupButton} onPress={() => setShowCustomModal(true)}>
            <Text style={styles.setupButtonText}>Add Chapters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Modal
        visible={!!selectedPlan}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPlan(null)}
      >
        {selectedPlan && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPlan(null)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalDay}>Day {selectedPlan.day_number}</Text>
              <Text style={styles.modalTitle}>{selectedPlan.title}</Text>
              <Text style={styles.modalReference}>{selectedPlan.reference}</Text>

              {selectedPlan.scripture_text && (
                <View style={styles.scriptureBox}>
                  <Text style={styles.scriptureText}>"{selectedPlan.scripture_text}"</Text>
                </View>
              )}

              {selectedPlan.reflection_question && (
                <View style={styles.reflectionBox}>
                  <Text style={styles.reflectionLabel}>Reflection</Text>
                  <Text style={styles.reflectionText}>{selectedPlan.reflection_question}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.markButton,
                  selectedPlan.is_completed && styles.markButtonCompleted
                ]}
                onPress={() => {
                  handleToggle(selectedPlan.id, selectedPlan.is_custom);
                  setSelectedPlan(prev => prev ? { ...prev, is_completed: !prev.is_completed } : null);
                }}
              >
                <Text style={[
                  styles.markButtonText,
                  selectedPlan.is_completed && styles.markButtonTextCompleted
                ]}>
                  {selectedPlan.is_completed ? 'Mark as Unread' : 'Mark as Read'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Custom Plan Setup Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add Readings</Text>

            <Text style={styles.label}>Start Book</Text>
            <TextInput
              style={styles.input}
              value={startBook}
              onChangeText={setStartBook}
              placeholder="e.g. Genesis"
            />

            <Text style={styles.label}>Start Chapter</Text>
            <TextInput
              style={styles.input}
              value={startChapter}
              onChangeText={setStartChapter}
              keyboardType="numeric"
              placeholder="1"
            />

            <Text style={styles.label}>End Book</Text>
            <TextInput
              style={styles.input}
              value={endBook}
              onChangeText={setEndBook}
              placeholder="e.g. Genesis"
            />

            <Text style={styles.label}>End Chapter</Text>
            <TextInput
              style={styles.input}
              value={endChapter}
              onChangeText={setEndChapter}
              keyboardType="numeric"
              placeholder="10"
            />

            <Text style={styles.label}>Chapters per Day</Text>
            <TextInput
              style={styles.input}
              value={chaptersPerDay}
              onChangeText={setChaptersPerDay}
              keyboardType="numeric"
              placeholder="1"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleAppendCustomPlan}
              >
                <Text style={styles.textStyle}>Add to Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  settingsButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  addChaptersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addChaptersText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#f0f0f0',
    borderColor: Colors.light.tint,
    borderWidth: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  cardReference: {
    fontSize: 14,
    color: '#666',
  },
  // Custom Plan Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 6,
  },
  buttonClose: {
    backgroundColor: '#ccc',
  },
  buttonSave: {
    backgroundColor: Colors.light.tint,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  modalDay: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalReference: {
    fontSize: 18,
    color: Colors.light.tint,
    marginBottom: 32,
  },
  scriptureBox: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  scriptureText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#444',
    fontStyle: 'italic',
  },
  reflectionBox: {
    marginBottom: 32,
  },
  reflectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  markButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  markButtonCompleted: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  markButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  markButtonTextCompleted: {
    color: '#666',
  },
});

