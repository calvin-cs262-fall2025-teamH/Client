import { api } from '@/lib/api';
import { Anniversary, CalendarEvent } from '@/types/api';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, []);

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
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Our Calendar</Text>

      {anniversaries && (
        <View style={styles.anniversariesSection}>
          <Text style={styles.sectionTitle}>💕 Our Journey Together</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{anniversaries.daysTogether}</Text>
              <Text style={styles.statLabel}>Days Together</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{anniversaries.monthsTogether}</Text>
              <Text style={styles.statLabel}>Months</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{anniversaries.yearsTogether}</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>

          <View style={styles.nextAnniversaryCard}>
            <Text style={styles.nextAnniversaryLabel}>Next Month Anniversary</Text>
            <Text style={styles.nextAnniversaryDate}>
              {formatFullDate(anniversaries.nextMonthAnniversary)}
            </Text>
            <Text style={styles.nextAnniversaryDays}>
              {getDaysUntil(anniversaries.nextMonthAnniversary)} days to go ✨
            </Text>
          </View>
        </View>
      )}

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>

        {events.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsIcon}>🗓️</Text>
            <Text style={styles.noEventsText}>No upcoming events</Text>
            <Text style={styles.noEventsSubtext}>
              Create memories and they&apos;ll appear here
            </Text>
          </View>
        ) : (
          events.map((event) => {
            const daysUntil = getDaysUntil(event.date);
            const isToday = daysUntil === 0;
            const isTomorrow = daysUntil === 1;

            return (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateText}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}
                  {isTomorrow && (
                    <View style={styles.tomorrowBadge}>
                      <Text style={styles.tomorrowBadgeText}>TOMORROW</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>

                {event.location && (
                  <View style={styles.eventLocationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                )}

                {event.activityTitle && (
                  <Text style={styles.eventActivity}>
                    Related to: {event.activityTitle}
                  </Text>
                )}

                {!isToday && !isTomorrow && (
                  <Text style={styles.eventDaysUntil}>
                    {daysUntil > 0
                      ? `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                      : `${Math.abs(daysUntil)} day${
                          Math.abs(daysUntil) !== 1 ? 's' : ''
                        } ago`}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  nextAnniversaryCard: {
    backgroundColor: '#FFE5EE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  nextAnniversaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nextAnniversaryDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nextAnniversaryDays: {
    fontSize: 14,
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
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  eventDateBadge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  todayBadge: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  tomorrowBadge: {
    backgroundColor: '#FFA500',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tomorrowBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventActivity: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  eventDaysUntil: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '600',
  },
});
