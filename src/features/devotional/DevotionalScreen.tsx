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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { DevotionalPlan } from '@/types/api';
import { Colors } from '@/constants/theme';
import { BIBLE_BOOKS } from '@/constants/bibleData';
import { HelpTooltip } from '@/components/HelpTooltip';

type Mode = 'couple' | 'year';
type SelectionType = 'startBook' | 'startChapter' | 'endBook' | 'endChapter' | null;
type BibleBook = typeof BIBLE_BOOKS[number];

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
  const [showCompleted, setShowCompleted] = useState(false);

  // Custom Plan Form State
  const [startBook, setStartBook] = useState(BIBLE_BOOKS[0]);
  const [startChapter, setStartChapter] = useState(1);
  const [endBook, setEndBook] = useState(BIBLE_BOOKS[0]);
  const [endChapter, setEndChapter] = useState(10);
  const [chaptersPerDay, setChaptersPerDay] = useState(1);
  
  // Selection Modal State
  const [selectionType, setSelectionType] = useState<SelectionType>(null);

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
        start_book: startBook.name,
        start_chapter: startChapter,
        end_book: endBook.name,
        end_chapter: endChapter,
        chapters_per_day: chaptersPerDay,
      });
      setShowCustomModal(false);
      Alert.alert('Success', 'Chapters added to your plan!');
      loadDevotionals();
    } catch {
      Alert.alert('Error', 'Failed to add chapters');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === plans.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(plans.map(p => p.id)));
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
            } catch {
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
    } catch {
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
  
  const activePlans = plans.filter(p => !p.is_completed);
  const completedPlans = plans.filter(p => p.is_completed);

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
          {item.scripture_text && item.scripture_text !== item.reference && (
            <Text style={styles.cardVerse} numberOfLines={2}>
              {item.scripture_text}
            </Text>
          )}
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleSelectAll} style={[styles.deleteButton, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.deleteButtonText, { color: '#1976D2' }]}>
                {selectedItems.size === plans.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete ({selectedItems.size})</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <HelpTooltip 
            title="Daily Bread Help"
            tips={[
              "Grow spiritually together with shared devotionals and Bible reading plans.",
              "Couples Plan: Curated devotionals specifically for couples to read together.",
              "Bible in Year: A plan to read through the Bible in a year.",
              "To add chapters to your Bible plan, tap 'Add Chapters'.",
              "To remove chapters, long press an item to enter selection mode.",
              "Mark items as read to track your progress together."
            ]}
          />
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
          data={activePlans}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            completedPlans.length > 0 ? (
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity 
                  style={styles.completedHeader} 
                  onPress={() => setShowCompleted(!showCompleted)}
                >
                  <Text style={styles.completedHeaderText}>
                    Completed ({completedPlans.length})
                  </Text>
                  <Ionicons 
                    name={showCompleted ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
                {showCompleted && (
                  <View>
                    {completedPlans.map(item => (
                      <View key={item.id} style={{ marginBottom: 16 }}>
                        {renderItem({ item })}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null
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
                  <Text style={styles.scriptureText}>&quot;{selectedPlan.scripture_text}&quot;</Text>
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
        onRequestClose={() => {
          if (selectionType) {
            setSelectionType(null);
          } else {
            setShowCustomModal(false);
          }
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, selectionType && styles.modalViewFull]}>
            {selectionType ? (
              <View style={{ flex: 1 }}>
                <View style={styles.selectionHeader}>
                  <TouchableOpacity onPress={() => setSelectionType(null)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.selectionTitle}>
                    Select {selectionType.includes('Book') ? 'Book' : 'Chapter'}
                  </Text>
                </View>
                <FlatList
                  data={
                    selectionType === 'startBook' || selectionType === 'endBook'
                      ? BIBLE_BOOKS
                      : Array.from({ length: (selectionType === 'startChapter' ? startBook.chapters : endBook.chapters) }, (_, i) => i + 1)
                  }
                  keyExtractor={(item) => (typeof item === 'number' ? item.toString() : item.name)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.selectionItem}
                      onPress={() => {
                        if (selectionType === 'startBook') {
                          setStartBook(item as BibleBook);
                          setStartChapter(1);
                          setEndBook(item as BibleBook);
                          setEndChapter(1);
                        } else if (selectionType === 'endBook') {
                          setEndBook(item as BibleBook);
                          setEndChapter(1);
                        } else if (selectionType === 'startChapter') {
                          setStartChapter(item as number);
                        } else if (selectionType === 'endChapter') {
                          setEndChapter(item as number);
                        }
                        setSelectionType(null);
                      }}
                    >
                      <Text style={styles.selectionItemText}>
                        {typeof item === 'number' ? `Chapter ${item}` : item.name}
                      </Text>
                      {typeof item !== 'number' && (
                        <Text style={styles.selectionItemSubtext}>{item.chapters} chapters</Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>Add Readings</Text>

                <Text style={styles.label}>Start Reading</Text>
                <View style={styles.row}>
                  <TouchableOpacity 
                    style={[styles.selector, { flex: 2, marginRight: 8 }]} 
                    onPress={() => setSelectionType('startBook')}
                  >
                    <Text style={styles.selectorText}>{startBook.name}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.selector, { flex: 1 }]} 
                    onPress={() => setSelectionType('startChapter')}
                  >
                    <Text style={styles.selectorText}>Ch {startChapter}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>End Reading</Text>
                <View style={styles.row}>
                  <TouchableOpacity 
                    style={[styles.selector, { flex: 2, marginRight: 8 }]} 
                    onPress={() => setSelectionType('endBook')}
                  >
                    <Text style={styles.selectorText}>{endBook.name}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.selector, { flex: 1 }]} 
                    onPress={() => setSelectionType('endChapter')}
                  >
                    <Text style={styles.selectorText}>Ch {endChapter}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Chapters per Day</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity 
                    style={styles.stepperButton}
                    onPress={() => setChaptersPerDay(Math.max(1, chaptersPerDay - 1))}
                  >
                    <Ionicons name="remove" size={24} color={Colors.light.tint} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{chaptersPerDay}</Text>
                  <TouchableOpacity 
                    style={styles.stepperButton}
                    onPress={() => setChaptersPerDay(chaptersPerDay + 1)}
                  >
                    <Ionicons name="add" size={24} color={Colors.light.tint} />
                  </TouchableOpacity>
                </View>

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
              </>
            )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  settingsButton: {
    padding: 8,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE5E5',
    borderRadius: 16,
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addChaptersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addChaptersText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#FFF0F3', // Light maroon background
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '700',
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  setupButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressValue: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#FFF9FA',
    borderColor: Colors.light.tint,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  cardReference: {
    fontSize: 15,
    color: Colors.light.gold, // Using gold for reference
    fontWeight: '600',
  },
  // Custom Plan Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonClose: {
    backgroundColor: '#F5F5F5',
  },
  buttonSave: {
    backgroundColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textStyle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    fontSize: 17,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  modalDay: {
    fontSize: 14,
    color: Colors.light.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 40,
  },
  modalReference: {
    fontSize: 20,
    color: '#666',
    marginBottom: 40,
    fontWeight: '500',
  },
  scriptureBox: {
    backgroundColor: '#FFF9FA', // Very light maroon tint
    padding: 28,
    borderRadius: 20,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  scriptureText: {
    fontSize: 18,
    lineHeight: 30,
    color: '#2C2C2C',
    fontStyle: 'italic',
    fontFamily: 'serif', // Use serif for scripture if available
  },
  reflectionBox: {
    marginBottom: 40,
  },
  reflectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#444',
  },
  markButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 40,
  },
  markButtonCompleted: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  markButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  markButtonTextCompleted: {
    color: '#888',
  },
  // New Selector Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepperButton: {
    padding: 8,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
  },
  selectionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectionItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectionItemSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  modalViewFull: {
    height: '80%',
    padding: 0,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardVerse: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completedHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

