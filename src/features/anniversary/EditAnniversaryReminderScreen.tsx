// Client/src/features/anniversary/EditAnniversaryReminderScreen.tsx
import { api } from '@/lib/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditAnniversaryReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminderId = parseInt(id || '0');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(7);
  const [isRecurring, setIsRecurring] = useState(true);

  useEffect(() => {
    loadReminder();
  }, []);

  const loadReminder = async () => {
    try {
      const response = await api.getAnniversaryReminders();
      if (response.success && response.data) {
        const reminder = response.data.find(r => r.id === reminderId);
        if (reminder) {
          setTitle(reminder.title);
          setDescription(reminder.description || '');
          setAnniversaryDate(new Date(reminder.anniversaryDate));
          setReminderDaysBefore(reminder.reminderDaysBefore);
          setIsRecurring(reminder.isRecurring);
        } else {
          Alert.alert('Error', 'Reminder not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('[EditReminder] Load error:', error);
      Alert.alert('Error', 'Failed to load reminder');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (reminderDaysBefore < 0 || reminderDaysBefore > 365) {
      Alert.alert('Error', 'Reminder days must be between 0 and 365');
      return;
    }

    setSaving(true);
    try {
      console.log('[EditReminder] Updating:', {
        id: reminderId,
        title: title.trim(),
        description: description.trim() || undefined,
        anniversaryDate: anniversaryDate.toISOString().split('T')[0],
        reminderDaysBefore,
        isRecurring,
      });

      const response = await api.updateAnniversaryReminder(reminderId, {
        title: title.trim(),
        description: description.trim() || undefined,
        anniversaryDate: anniversaryDate.toISOString().split('T')[0],
        reminderDaysBefore,
        isRecurring,
      });

      console.log('[EditReminder] Response:', response);

      if (response.success) {
        Alert.alert('Success', 'Anniversary reminder updated!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        console.error('[EditReminder] API returned error:', response);
        Alert.alert('Error', response.error || response.message || 'Failed to update anniversary reminder');
      }
    } catch (error) {
      console.error('[EditReminder] Exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update anniversary reminder';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B2332" />
          <Text style={styles.loadingText}>Loading reminder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Reminder</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., First Date Anniversary"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes about this anniversary..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Anniversary Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateButtonText}>{formatDate(anniversaryDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={anniversaryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setAnniversaryDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Remind Me (Days Before)</Text>
            <View style={styles.daysContainer}>
              {[1, 3, 7, 14, 30].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.dayChip,
                    reminderDaysBefore === days && styles.dayChipActive,
                  ]}
                  onPress={() => setReminderDaysBefore(days)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      reminderDaysBefore === days && styles.dayChipTextActive,
                    ]}
                  >
                    {days}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.numberInput]}
              value={reminderDaysBefore.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setReminderDaysBefore(num);
              }}
              keyboardType="number-pad"
              placeholder="Custom days"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchIcon}>🔄</Text>
                <View>
                  <Text style={styles.label}>Recurring Yearly</Text>
                  <Text style={styles.switchSubtext}>Remind me every year</Text>
                </View>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#d1d5db', true: '#f5c8d2' }}
                thumbColor={isRecurring ? '#8B2332' : '#f4f3f4'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.updateButtonText}>✓ Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B2332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B2332',
    flex: 1,
  },
  headerRight: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#8B2332',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#f5c8d2',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f5c8d2',
  },
  dateIcon: {
    fontSize: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#f5c8d2',
  },
  dayChipActive: {
    backgroundColor: '#8B2332',
    borderColor: '#8B2332',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B2332',
  },
  dayChipTextActive: {
    color: '#FFF',
  },
  numberInput: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f5c8d2',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchIcon: {
    fontSize: 20,
  },
  switchSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  updateButton: {
    backgroundColor: '#8B2332',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
