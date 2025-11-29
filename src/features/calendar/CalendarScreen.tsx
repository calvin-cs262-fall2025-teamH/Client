import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = (SCREEN_WIDTH - 48) / 7;

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  isAllDay: boolean;
  eventType: string;
  addedBy: number;
  addedByName: string;
  location?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventListModal, setShowEventListModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(true);
  const [eventType, setEventType] = useState('other');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Relationship days
  const [daysTogether, setDaysTogether] = useState<number | null>(null);

  const eventTypes = [
    { value: 'anniversary', label: 'Anniversary', icon: '💝', color: '#ff6b9d' },
    { value: 'date', label: 'Date', icon: '💕', color: '#ff9ecd' },
    { value: 'work', label: 'Work', icon: '💼', color: '#5c9eff' },
    { value: 'life', label: 'Life', icon: '🌟', color: '#ffb84d' },
    { value: 'important', label: 'Important', icon: '⭐', color: '#ff5252' },
    { value: 'other', label: 'Other', icon: '📅', color: '#9e9e9e' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchAnniversaries();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.getCalendarEvents();
      if (response.success && response.data) {
        const formattedEvents = response.data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.event_date || e.date,
          time: e.event_time || e.time,
          isAllDay: e.is_all_day ?? e.isAllDay,
          eventType: e.event_type || e.eventType || 'other',
          addedBy: e.added_by_user_id || e.addedBy,
          addedByName: e.added_by_name || e.addedByName || '',
          location: e.location
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchAnniversaries = async () => {
    try {
      const response = await api.getAnniversaries();
      if (response.success && response.data) {
        setDaysTogether(response.data.daysTogether || 0);
      }
    } catch (error) {
      console.error('Failed to fetch anniversaries:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    await fetchAnniversaries();
    setRefreshing(false);
  }, []);

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return events.filter(e => e.date.split('T')[0] === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDayPress = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);

    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      setShowEventListModal(true);
    } else {
      openCreateEventModal(date);
    }
  };

  const openCreateEventModal = (date?: Date) => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedTime(new Date());
    setIsAllDay(true);
    setEventType('other');
    if (date) {
      setSelectedDate(date);
    }
    setShowEventModal(true);
    setShowEventListModal(false);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setLocation(event.location || '');
    if (event.time) {
      const [hours, minutes] = event.time.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      setSelectedTime(time);
    }
    setIsAllDay(event.isAllDay);
    setEventType(event.eventType);
    setSelectedDate(new Date(event.date));
    setShowEventModal(true);
    setShowEventListModal(false);
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        date: formatDateString(selectedDate),
        time: isAllDay ? null : selectedTime.toTimeString().split(' ')[0],
        isAllDay,
        eventType,
        location: location.trim() || null
      };

      let response;
      if (editingEvent) {
        response = await api.updateCalendarEvent(editingEvent.id, eventData);
      } else {
        response = await api.createCalendarEvent(eventData);
      }

      if (response.success) {
        setShowEventModal(false);
        fetchEvents();
        Alert.alert('Success', editingEvent ? 'Event updated!' : 'Event created!');
      } else {
        Alert.alert('Error', 'Failed to save event');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteCalendarEvent(event.id);

              if (response.success) {
                fetchEvents();
                setShowEventListModal(false);
                Alert.alert('Success', 'Event deleted!');
              } else {
                Alert.alert('Error', 'Failed to delete event');
              }
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete event.');
            }
          }
        }
      ]
    );
  };

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[5];
  };

  const renderCalendarDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    const today = isToday(day);

    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayCell, today && styles.todayCell]}
        onPress={() => handleDayPress(day)}
      >
        <Text style={[styles.dayText, today && styles.todayText]}>{day}</Text>
        {hasEvents && (
          <View style={styles.eventDotsContainer}>
            {dayEvents.slice(0, 3).map((event, idx) => (
              <View
                key={idx}
                style={[
                  styles.eventDot,
                  { backgroundColor: getEventTypeInfo(event.eventType).color }
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with days together */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Calendar 💕</Text>
        {daysTogether !== null && (
          <Text style={styles.daysTogetherText}>Day {daysTogether} Together</Text>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B2332']} />
        }
      >
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#8B2332" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday}>
            <Text style={styles.monthTitle}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#8B2332" />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map(day => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {generateCalendarDays().map((day, index) => renderCalendarDay(day, index))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {events.filter(e => new Date(e.date) >= new Date()).slice(0, 5).map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.upcomingEventCard}
              onPress={() => openEditEventModal(event)}
            >
              <View style={[styles.eventTypeBar, { backgroundColor: getEventTypeInfo(event.eventType).color }]} />
              <View style={styles.upcomingEventContent}>
                <Text style={styles.upcomingEventTitle}>{event.title}</Text>
                <Text style={styles.upcomingEventDate}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {!event.isAllDay && event.time && ` at ${event.time.slice(0, 5)}`}
                </Text>
                {event.location && (
                  <Text style={styles.upcomingEventLocation}>📍 {event.location}</Text>
                )}
              </View>
              <Text style={styles.eventTypeIcon}>{getEventTypeInfo(event.eventType).icon}</Text>
            </TouchableOpacity>
          ))}
          {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
            <Text style={styles.noEventsText}>No upcoming events. Tap a date to add one!</Text>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => openCreateEventModal(new Date())}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Event List Modal (when clicking a day with events) */}
      <Modal
        visible={showEventListModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEventListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventListModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setShowEventListModal(false)}>
                <Ionicons name="close" size={24} color="#8B2332" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.eventListContent}>
              {selectedDate && getEventsForDate(selectedDate.getDate()).map(event => (
                <View key={event.id} style={styles.eventListItem}>
                  <View style={[styles.eventTypeBar, { backgroundColor: getEventTypeInfo(event.eventType).color }]} />
                  <View style={styles.eventListItemContent}>
                    <Text style={styles.eventListItemTitle}>{event.title}</Text>
                    {!event.isAllDay && event.time && (
                      <Text style={styles.eventListItemTime}>🕐 {event.time.slice(0, 5)}</Text>
                    )}
                    {event.location && (
                      <Text style={styles.eventListItemLocation}>📍 {event.location}</Text>
                    )}
                  </View>
                  <View style={styles.eventListItemActions}>
                    <TouchableOpacity onPress={() => openEditEventModal(event)}>
                      <Ionicons name="create-outline" size={20} color="#8B2332" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEvent(event)} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.addEventButton}
              onPress={() => openCreateEventModal(selectedDate || undefined)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addEventButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create/Edit Event Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createEventModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEvent ? 'Edit Event' : 'New Event'}
              </Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close" size={24} color="#8B2332" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              {/* Date Display */}
              <View style={styles.selectedDateDisplay}>
                <Ionicons name="calendar" size={20} color="#8B2332" />
                <Text style={styles.selectedDateText}>
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What's the event?"
                placeholderTextColor="#999"
              />

              {/* Location */}
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Where?"
                placeholderTextColor="#999"
              />

              {/* Description */}
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />

              {/* Event Type */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.eventTypeGrid}>
                {eventTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.eventTypeButton,
                      eventType === type.value && { borderColor: type.color, backgroundColor: `${type.color}20` }
                    ]}
                    onPress={() => setEventType(type.value)}
                  >
                    <Text style={styles.eventTypeButtonIcon}>{type.icon}</Text>
                    <Text style={[styles.eventTypeButtonLabel, eventType === type.value && { color: type.color }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* All Day Toggle */}
              <TouchableOpacity style={styles.toggleRow} onPress={() => setIsAllDay(!isAllDay)}>
                <Text style={styles.label}>All Day</Text>
                <Ionicons
                  name={isAllDay ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isAllDay ? '#8B2332' : '#999'}
                />
              </TouchableOpacity>

              {/* Time Picker */}
              {!isAllDay && (
                <>
                  <Text style={styles.label}>Time</Text>
                  <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                    <Ionicons name="time-outline" size={20} color="#8B2332" />
                    <Text style={styles.timeButtonText}>
                      {selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, time) => {
                        setShowTimePicker(Platform.OS === 'ios');
                        if (time) setSelectedTime(time);
                      }}
                    />
                  )}
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEventModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
                <Text style={styles.saveButtonText}>{editingEvent ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#f8e5e8',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B2332',
    textAlign: 'center'
  },
  daysTogetherText: {
    fontSize: 14,
    color: '#8B2332',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  navButton: {
    padding: 8
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B2332'
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  weekdayCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
    paddingVertical: 8
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B2332',
    opacity: 0.7
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8
  },
  todayCell: {
    backgroundColor: '#f8e5e8',
    borderRadius: DAY_WIDTH / 2
  },
  dayText: {
    fontSize: 16,
    color: '#333'
  },
  todayText: {
    fontWeight: 'bold',
    color: '#8B2332'
  },
  eventDotsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  upcomingSection: {
    padding: 16,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B2332',
    marginBottom: 12
  },
  upcomingEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden'
  },
  eventTypeBar: {
    width: 4,
    height: '100%',
    minHeight: 60
  },
  upcomingEventContent: {
    flex: 1,
    padding: 12
  },
  upcomingEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  upcomingEventDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  upcomingEventLocation: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  eventTypeIcon: {
    fontSize: 24,
    marginRight: 12
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B2332',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  eventListModal: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8e5e8'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B2332'
  },
  eventListContent: {
    padding: 16,
    maxHeight: 300
  },
  eventListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden'
  },
  eventListItemContent: {
    flex: 1,
    padding: 12
  },
  eventListItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  eventListItemTime: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  eventListItemLocation: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  eventListItemActions: {
    flexDirection: 'row',
    paddingRight: 12
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B2332',
    margin: 16,
    padding: 14,
    borderRadius: 10,
    gap: 8
  },
  addEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  createEventModal: {
    width: '100%',
    height: '85%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0
  },
  formContent: {
    padding: 20,
    flex: 1
  },
  selectedDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8e5e8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8
  },
  selectedDateText: {
    fontSize: 15,
    color: '#8B2332',
    fontWeight: '500'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  eventTypeButton: {
    width: '31%',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  eventTypeButtonIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  eventTypeButtonLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fafafa',
    gap: 10
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#8B2332',
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default CalendarScreen;
