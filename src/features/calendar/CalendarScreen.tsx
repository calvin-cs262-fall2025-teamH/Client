import { api } from '@/lib/api';
import { Anniversary, CalendarEvent } from '@/types/api';
import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

type Category = 'All' | 'Anniversary' | 'Work' | 'Life' | 'Other';

export function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcStartDate, setCalcStartDate] = useState('');
  const [calcEndDate, setCalcEndDate] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const [pinnedEvents, setPinnedEvents] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [])
  );

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, anniversariesResponse] = await Promise.all([
        api.getUpcomingEvents(),
        api.getAnniversaries(),
      ]);
      setEvents(eventsResponse.data || []);
      setAnniversaries(anniversariesResponse.data || null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = (id: number) => {
    setPinnedEvents(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();

    // Reset time components to compare dates only
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = targetDate.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const calculateDateDiff = () => {
    if (!calcStartDate || !calcEndDate) {
      Alert.alert('Error', 'Please enter both dates (YYYY-MM-DD)');
      return;
    }
    const start = new Date(calcStartDate);
    const end = new Date(calcEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
      return;
    }
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setCalcResult(days);
  };

  const filteredEvents = events
    .filter(event => {
      if (selectedCategory === 'All') return true;
      return true;
    })
    .sort((a, b) => {
      // Sort by pinned first
      const aPinned = pinnedEvents.includes(a.id);
      const bPinned = pinnedEvents.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Then by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Days Matter</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => Alert.alert('Today in History', 'On this day in 1969, Apollo 12 astronauts landed on the Moon.')} style={styles.historyButton}>
              <Text style={styles.historyButtonText}>📜 History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCalculator(true)} style={styles.calcButton}>
              <Text style={styles.calcButtonText}>🔢 Calc</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {(['All', 'Anniversary', 'Work', 'Life', 'Other'] as Category[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {anniversaries && (
          <View style={styles.anniversariesSection}>
            <View style={styles.daysMatterCard}>
              <View style={styles.daysMatterHeader}>
                <Text style={styles.daysMatterLabel}>We&apos;ve been together for</Text>
                <Text style={styles.daysMatterIcon}>❤️</Text>
              </View>

              <View style={styles.daysMatterCountContainer}>
                <Text style={styles.daysMatterNumber}>{anniversaries.daysTogether}</Text>
                <Text style={styles.daysMatterUnit}>Days</Text>
              </View>

              <View style={styles.daysMatterFooter}>
                <Text style={styles.daysMatterDate}>Since {formatFullDate(anniversaries.startDate)}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.eventsSection}>
          {filteredEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsIcon}>🗓️</Text>
              <Text style={styles.noEventsText}>No upcoming events</Text>
              <Text style={styles.noEventsSubtext}>
                Create memories and they&apos;ll appear here
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => {
              const daysUntil = getDaysUntil(event.date);
              const isPast = daysUntil < 0;
              const absDays = Math.abs(daysUntil);
              const isPinned = pinnedEvents.includes(event.id);

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.dmEventRow, isPinned && styles.dmEventRowPinned]}
                  onLongPress={() => togglePin(event.id)}
                  onPress={() => {
                    if (event.activityId) {
                      router.push({
                        pathname: '/memory-detail',
                        params: { id: event.activityId }
                      });
                    }
                  }}
                  delayLongPress={500}
                >
                  <View style={styles.dmEventLeft}>
                    <View style={styles.titleRow}>
                      {isPinned && <Text style={styles.pinIcon}>📌</Text>}
                      <Text style={styles.dmEventTitle}>{event.title}</Text>
                    </View>
                    <View style={styles.dmEventMetaRow}>
                      <Text style={styles.dmEventDate}>{formatDate(event.date)}</Text>
                      <Text style={styles.dmEventLunar}>Lunar: N/A</Text>
                    </View>
                  </View>

                  <View style={[styles.dmEventRight, isPast ? styles.dmEventRightPast : styles.dmEventRightFuture]}>
                    <Text style={styles.dmEventDays}>{absDays}</Text>
                    <Text style={styles.dmEventUnit}>Days</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Date Calculator Modal */}
      <Modal visible={showCalculator} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Date Calculator</Text>
            <Text style={styles.modalSubtitle}>Calculate days between two dates</Text>

            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              value={calcStartDate}
              onChangeText={setCalcStartDate}
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              value={calcEndDate}
              onChangeText={setCalcEndDate}
            />

            {calcResult !== null && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Difference:</Text>
                <Text style={styles.resultValue}>{calcResult} Days</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowCalculator(false)}>
                <Text style={styles.modalButtonTextSecondary}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={calculateDateDiff}>
                <Text style={styles.modalButtonTextPrimary}>Calculate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  anniversariesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  daysMatterCard: {
    backgroundColor: '#8B2332',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  daysMatterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  daysMatterLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  daysMatterIcon: {
    fontSize: 20,
  },
  daysMatterCountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  daysMatterNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 80,
  },
  daysMatterUnit: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  daysMatterFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  daysMatterDate: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  secondaryStatItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  secondaryStatUnit: {
    fontSize: 12,
    color: '#8B2332',
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryStatDate: {
    fontSize: 12,
    color: '#666',
  },
  eventsSection: {},
  noEventsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noEventsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B2332',
  },
  historyButtonText: {
    color: '#8B2332',
    fontWeight: '600',
    fontSize: 14,
  },
  calcButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B2332',
  },
  calcButtonText: {
    color: '#8B2332',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryScroll: {
    marginBottom: 20,
    maxHeight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#8B2332',
    borderColor: '#8B2332',
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  dmEventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dmEventRowPinned: {
    backgroundColor: '#FFF5F7',
    borderColor: '#8B2332',
    borderWidth: 1,
  },
  dmEventLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  pinIcon: {
    fontSize: 12,
  },
  dmEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dmEventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dmEventDate: {
    fontSize: 12,
    color: '#999',
  },
  dmEventLunar: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  dmEventRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  dmEventRightFuture: {
    backgroundColor: '#3B82F6', // Blue for future
  },
  dmEventRightPast: {
    backgroundColor: '#F59E0B', // Orange for past
  },
  dmEventDays: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 4,
  },
  dmEventUnit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  resultContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B2332',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#8B2332',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});
