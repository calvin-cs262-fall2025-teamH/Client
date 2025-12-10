// Client/src/features/anniversary/AnniversaryRemindersScreen.tsx
import { api } from '@/lib/api';
import type { AnniversaryReminder } from '@/types/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpTooltip } from '@/components/HelpTooltip';

export default function AnniversaryRemindersScreen() {
  const [reminders, setReminders] = useState<AnniversaryReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleToggleEnabled = async (id: number) => {
    // Optimistic update - immediately update UI
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, isEnabled: !reminder.isEnabled }
          : reminder
      )
    );

    try {
      const response = await api.toggleAnniversaryReminderEnabled(id);
      if (response.success && response.data) {
        // Update with server response to ensure consistency
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === id ? response.data! : reminder
          )
        );
      } else {
        // Revert on failure
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === id
              ? { ...reminder, isEnabled: !reminder.isEnabled }
              : reminder
          )
        );
        Alert.alert('Error', 'Failed to update reminder');
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      // Revert on error
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === id
            ? { ...reminder, isEnabled: !reminder.isEnabled }
            : reminder
        )
      );
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

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

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anniversaryDate = new Date(dateString);
    anniversaryDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (anniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil;
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
            reminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.anniversaryDate);
              return (
                <View
                  key={reminder.id}
                  style={[
                    styles.reminderCard,
                    !reminder.isEnabled && styles.reminderCardDisabled
                  ]}
                >
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderTitleRow}>
                      <Text style={[
                        styles.reminderTitle,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
                        {reminder.title}
                      </Text>
                      {reminder.isRecurring && (
                        <Text style={[
                          styles.recurringBadge,
                          !reminder.isEnabled && styles.textDisabled
                        ]}>
                          🔄 Yearly
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={reminder.isEnabled}
                      onValueChange={() => handleToggleEnabled(reminder.id)}
                      trackColor={{ false: '#e5e7eb', true: '#8B2332' }}
                      thumbColor={reminder.isEnabled ? '#ffffff' : '#9ca3af'}
                      ios_backgroundColor="#e5e7eb"
                    />
                  </View>

                  {reminder.description && (
                    <Text style={[
                      styles.reminderDescription,
                      !reminder.isEnabled && styles.textDisabled
                    ]}>
                      {reminder.description}
                    </Text>
                  )}

                  <View style={styles.reminderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[
                        styles.detailLabel,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
                        📅 Date:
                      </Text>
                      <Text style={[
                        styles.detailValue,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
                        {formatDate(reminder.anniversaryDate)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[
                        styles.detailLabel,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
                        ⏰ Remind:
                      </Text>
                      <Text style={[
                        styles.detailValue,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
                        {reminder.reminderDaysBefore} days before
                      </Text>
                    </View>
                    {daysUntil >= 0 && (
                      <View style={styles.detailRow}>
                        <Text style={[
                          styles.detailLabel,
                          !reminder.isEnabled && styles.textDisabled
                        ]}>
                          ⏳ In:
                        </Text>
                        <Text style={[
                          styles.detailValue,
                          daysUntil <= 7 && styles.detailValueUrgent,
                          !reminder.isEnabled && styles.textDisabled
                        ]}>
                          {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? '1 day' : `${daysUntil} days`}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleDelete(reminder.id, reminder.title)}
                    >
                      <Text style={[
                        styles.deleteButtonText,
                        !reminder.isEnabled && styles.textDisabled
                      ]}>
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
    marginRight: 16,
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
  },
  headerRight: {
    width: 80,
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
  deleteButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  textDisabled: {
    opacity: 0.5,
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
