// Client/src/features/anniversary/AnniversaryRemindersScreen.tsx
import { api } from '@/lib/api';
import type { AnniversaryReminder, ReminderChecklistItem } from '@/types/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpTooltip } from '@/components/HelpTooltip';

export default function AnniversaryRemindersScreen() {
  const [reminders, setReminders] = useState<AnniversaryReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState<Set<number>>(new Set());
  const [checklistItems, setChecklistItems] = useState<Record<number, ReminderChecklistItem[]>>({});
  const [newChecklistText, setNewChecklistText] = useState<Record<number, string>>({});

  const loadReminders = useCallback(async () => {
    try {
      const response = await api.getAnniversaryReminders();
      if (response.success && response.data) {
        setReminders(response.data);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
      Alert.alert('Error', 'Failed to load anniversary reminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReminders();
  }, [loadReminders]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteAnniversaryReminder(id);
              if (response.success) {
                setReminders((prev) => prev.filter((r) => r.id !== id));
                Alert.alert('Success', 'Reminder deleted');
              }
            } catch (error) {
              console.error('Failed to delete reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
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

  const getDaysUntil = (dateString: string, isRecurring: boolean = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anniversaryDate = new Date(dateString);
    anniversaryDate.setHours(0, 0, 0, 0);

    // For recurring reminders, if the date has passed this year, use next year's date
    if (isRecurring) {
      const currentYear = today.getFullYear();
      anniversaryDate.setFullYear(currentYear);

      // If the date has already passed this year, move to next year
      if (anniversaryDate < today) {
        anniversaryDate.setFullYear(currentYear + 1);
      }
    }

    const daysUntil = Math.ceil(
      (anniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil;
  };

  const toggleExpanded = async (reminderId: number) => {
    const newExpanded = new Set(expandedReminders);
    if (newExpanded.has(reminderId)) {
      newExpanded.delete(reminderId);
    } else {
      newExpanded.add(reminderId);
      // Load checklist items if not loaded
      if (!checklistItems[reminderId]) {
        try {
          const response = await api.getChecklistItems(reminderId);
          if (response.success && response.data) {
            setChecklistItems(prev => ({ ...prev, [reminderId]: response.data || [] }));
          }
        } catch (error) {
          console.error('Failed to load checklist:', error);
        }
      }
    }
    setExpandedReminders(newExpanded);
  };

  const handleAddChecklistItem = async (reminderId: number) => {
    const text = newChecklistText[reminderId]?.trim();
    if (!text) return;

    try {
      const response = await api.createChecklistItem(reminderId, { title: text });
      if (response.success && response.data) {
        setChecklistItems(prev => ({
          ...prev,
          [reminderId]: [...(prev[reminderId] || []), response.data!]
        }));
        setNewChecklistText(prev => ({ ...prev, [reminderId]: '' }));
      }
    } catch (error) {
      console.error('Failed to add checklist item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };



  const handleToggleChecklistItem = async (reminderId: number, itemId: number, currentState: boolean) => {
    try {
      const response = await api.updateChecklistItem(reminderId, itemId, { isCompleted: !currentState });
      if (response.success) {
        setChecklistItems(prev => ({
          ...prev,
          [reminderId]: (prev[reminderId] || []).map(item =>
            item.id === itemId ? { ...item, isCompleted: !currentState } : item
          )
        }));
      }
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteChecklistItem = async (reminderId: number, itemId: number) => {
    try {
      const response = await api.deleteChecklistItem(reminderId, itemId);
      if (response.success) {
        setChecklistItems(prev => ({
          ...prev,
          [reminderId]: (prev[reminderId] || []).filter(item => item.id !== itemId)
        }));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B2332" />
          </TouchableOpacity>
          <Text style={styles.title}>Anniversary Reminders</Text>
          <HelpTooltip
            title="Anniversary Help"
            tips={[
              'Tap + to create a new anniversary reminder',
              'Toggle the switch to enable/disable reminders',
              'Set how many days before to be reminded',
              'Recurring reminders repeat every year',
            ]}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B2332"
            />
          }
        >
          {reminders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No anniversary reminders yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + Add button to create your first reminder
              </Text>
            </View>
          ) : (
            [...reminders]
              .sort((a, b) => {
                // Sort by days until (closest first)
                const daysA = getDaysUntil(a.anniversaryDate, a.isRecurring);
                const daysB = getDaysUntil(b.anniversaryDate, b.isRecurring);
                return daysA - daysB;
              })
              .map((reminder) => {
                const daysUntil = getDaysUntil(reminder.anniversaryDate, reminder.isRecurring);
                const isExpanded = expandedReminders.has(reminder.id);
                const items = checklistItems[reminder.id] || [];

                return (
                  <View
                    key={reminder.id}
                    style={styles.reminderCard}
                  >
                    {/* Countdown Badge - Prominent Display */}
                    {daysUntil >= 0 && (
                      <View style={[
                        styles.countdownBadge,
                        daysUntil === 0 && styles.countdownBadgeToday,
                        daysUntil > 0 && daysUntil <= 7 && styles.countdownBadgeUrgent,
                      ]}>
                        <Text style={[
                          styles.countdownDays,
                          daysUntil === 0 && styles.countdownDaysToday,
                        ]}>
                          {daysUntil === 0 ? 'TODAY!' : daysUntil}
                        </Text>
                        {daysUntil > 0 && (
                          <Text style={styles.countdownLabel}>
                            {daysUntil === 1 ? 'day left' : 'days left'}
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.reminderHeader}>
                      <View style={styles.reminderTitleRow}>
                        <Text style={styles.reminderTitle}>
                          {reminder.title}
                        </Text>
                        {reminder.isRecurring && (
                          <Text style={styles.recurringBadge}>
                            🔄 Yearly
                          </Text>
                        )}
                      </View>
                    </View>

                    {reminder.description && (
                      <Text style={styles.reminderDescription}>
                        {reminder.description}
                      </Text>
                    )}

                    <View style={styles.reminderDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          📅 Date:
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatDate(reminder.anniversaryDate)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          ⏰ Remind:
                        </Text>
                        <Text style={styles.detailValue}>
                          {reminder.reminderDaysBefore} days before
                        </Text>
                      </View>
                    </View>

                    {/* Prepare List Toggle Button */}
                    <TouchableOpacity
                      style={styles.prepareListToggle}
                      onPress={() => toggleExpanded(reminder.id)}
                    >
                      <Text style={styles.prepareListToggleText}>
                        📋 Prepare List ({isExpanded ? items.length : (reminder.checklistCount || 0)})
                      </Text>
                      <Text style={styles.prepareListToggleIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>

                    {/* Expanded Prepare List */}
                    {isExpanded && (
                      <View style={styles.prepareListContainer}>
                        {items.map(item => (
                          <View key={item.id} style={styles.checklistItem}>
                            <TouchableOpacity
                              style={styles.checklistCheckbox}
                              onPress={() => handleToggleChecklistItem(reminder.id, item.id, item.isCompleted)}
                            >
                              <Text style={styles.checklistCheckboxIcon}>
                                {item.isCompleted ? '☑' : '☐'}
                              </Text>
                            </TouchableOpacity>

                            <View style={{ flex: 1 }}>
                              <Text style={[
                                styles.checklistItemText,
                                item.isCompleted && styles.checklistItemCompleted
                              ]}>
                                {item.title}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => handleDeleteChecklistItem(reminder.id, item.id)}
                              style={styles.checklistDeleteButton}
                            >
                              <Text style={styles.checklistDeleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        ))}

                        {/* Add New Item */}
                        <View style={styles.addChecklistItemContainer}>
                          <TextInput
                            style={styles.addChecklistItemInput}
                            placeholder="Add preparation item..."
                            placeholderTextColor="#999"
                            value={newChecklistText[reminder.id] || ''}
                            onChangeText={(text) => setNewChecklistText(prev => ({ ...prev, [reminder.id]: text }))}
                            onSubmitEditing={() => handleAddChecklistItem(reminder.id)}
                          />
                          <TouchableOpacity
                            style={styles.addChecklistItemButton}
                            onPress={() => handleAddChecklistItem(reminder.id)}
                          >
                            <Text style={styles.addChecklistItemButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`/edit-anniversary-reminder/${reminder.id}`)}
                      >
                        <Text style={styles.editButtonText}>
                          ✏️ Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleDelete(reminder.id, reminder.title)}
                      >
                        <Text style={styles.deleteButtonText}>
                          🗑️ Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/create-anniversary-reminder')}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8e5e8',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8e5e8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B2332',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#8B2332',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B2332',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B2332',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderCardDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B2332',
  },
  recurringBadge: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  reminderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailValueUrgent: {
    color: '#8B2332',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 12,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    fontSize: 14,
    color: '#8B2332',
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  textDisabled: {
    opacity: 0.5,
  },
  // 🎯 Countdown Badge Styles
  countdownBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownBadgeToday: {
    backgroundColor: '#ffc9d9',
  },
  countdownBadgeUrgent: {
    backgroundColor: '#FFFFFF',
  },
  countdownBadgeDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  countdownDays: {
    fontSize: 32,
    fontWeight: '700',
    color: '#d4779c',
    letterSpacing: -0.5,
  },
  countdownDaysToday: {
    color: '#8B2332',
    fontWeight: '900',
  },
  countdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d4779c',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Prepare List Styles
  prepareListToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  prepareListToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B2332',
  },
  prepareListToggleIcon: {
    fontSize: 12,
    color: '#8B2332',
  },
  prepareListContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 6,
  },
  checklistCheckbox: {
    paddingRight: 10,
  },
  checklistCheckboxIcon: {
    fontSize: 20,
    color: '#8B2332',
  },
  checklistItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  checklistItemCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checklistDeleteButton: {
    padding: 4,
  },
  checklistDeleteIcon: {
    fontSize: 18,
  },
  addChecklistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  addChecklistItemInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  addChecklistItemButton: {
    backgroundColor: '#8B2332',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChecklistItemButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B2332',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
