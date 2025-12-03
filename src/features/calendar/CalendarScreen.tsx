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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { CalendarEvent, CreateCalendarEventRequest } from '@/types/api';
import * as Calendar from 'expo-calendar';

type ViewMode = 'month' | 'week' | 'day';

interface TimeSlot {
  hour: number;
  events: CalendarEvent[];
}

export default function CalendarScreen() {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Date navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Data state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventType, setEventType] = useState<'date' | 'anniversary' | 'reminder' | 'other'>('other');

  // Date picker state for event modal
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMonth, setDatePickerMonth] = useState(new Date());

  // Theme colors
  const theme = {
    primary: '#8B2332',
    background: '#f8e5e8',
    card: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    border: '#f5c8d2',
    accent: '#e91e63',
  };

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.getCalendarEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchEvents(true);
  }, []);

  // Date helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const formatDate = (date: Date) => {
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Normalize event date for comparison (handles different date formats from API)
  const normalizeDate = (dateStr: string | Date) => {
    if (!dateStr) return '';
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      week.push(d);
    }
    return week;
  };

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => {
      const eventDateStr = normalizeDate(event.date || event.event_date || '');
      return eventDateStr === dateStr;
    });
  }, [events]);

  // Get time slots for day view
  const getTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const dateEvents = getEventsForDate(date);
    const slots: TimeSlot[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = dateEvents.filter(event => {
        if (event.isAllDay || event.is_all_day) return false;
        const eventTime = event.time || event.event_time;
        if (!eventTime) return false;
        const eventHour = parseInt(eventTime.split(':')[0]);
        return eventHour === hour;
      });
      slots.push({ hour, events: hourEvents });
    }
    return slots;
  }, [getEventsForDate]);

  // All day events for a date
  const getAllDayEvents = useCallback((date: Date) => {
    return getEventsForDate(date).filter(event => {
      const isAllDay = event.isAllDay || event.is_all_day;
      const hasTime = event.time || event.event_time;
      return isAllDay || !hasTime;
    });
  }, [getEventsForDate]);

  // Navigation handlers
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  // Open add event modal
  const openAddEventModal = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setSelectedEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventLocation('');
    setIsAllDay(true);
    setStartTime('09:00');
    setEndTime('10:00');
    setEventType('other');
    setShowEventModal(true);
  };

  // Open edit event modal
  const openEditEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventLocation(event.location || '');
    setIsAllDay(event.isAllDay);
    setStartTime(event.time || '09:00');
    setEndTime(event.endTime || '10:00');
    setEventType(event.eventType as any || 'other');
    setShowEventModal(true);
    setShowEventList(false);
  };

  // Save event
  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      const eventData: CreateCalendarEventRequest = {
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        date: formatDate(selectedDate),
        time: isAllDay ? undefined : startTime,
        endTime: isAllDay ? undefined : endTime,
        isAllDay,
        eventType,
        location: eventLocation.trim() || undefined,
      };

      let response;
      if (selectedEvent) {
        response = await api.updateCalendarEvent(selectedEvent.id, eventData);
      } else {
        response = await api.createCalendarEvent(eventData);
      }

      if (response.success) {
        setShowEventModal(false);
        fetchEvents();
        Alert.alert('Success', selectedEvent ? 'Event updated!' : 'Event created!');
      } else {
        Alert.alert('Error', response.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteCalendarEvent(selectedEvent.id);
              if (response.success) {
                setShowEventModal(false);
                fetchEvents();
              }
            } catch (_error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  // Sync to phone calendar
  const syncToPhoneCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar access is required to sync events');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);

      if (!defaultCalendar) {
        Alert.alert('Error', 'No writable calendar found');
        return;
      }

      let syncCount = 0;
      for (const event of events) {
        const startDate = new Date(`${event.date}T${event.time || '00:00'}:00`);
        const endDate = new Date(`${event.date}T${event.endTime || event.time || '23:59'}:00`);

        await Calendar.createEventAsync(defaultCalendar.id, {
          title: event.title,
          notes: event.description,
          location: event.location,
          startDate,
          endDate,
          allDay: event.isAllDay,
        });
        syncCount++;
      }

      Alert.alert('Success', `Synced ${syncCount} events to your phone calendar`);
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync events');
    }
  };

  // Time picker component - with input boxes for hour and minute
  const TimePicker = ({
    value,
    onChange,
    label
  }: {
    value: string;
    onChange: (time: string) => void;
    label: string;
  }) => {
    const [hour, minute] = value.split(':');
    const [hourInput, setHourInput] = useState(hour);
    const [minuteInput, setMinuteInput] = useState(minute);

    const handleHourChange = (text: string) => {
      // Only allow numbers
      const numericText = text.replace(/[^0-9]/g, '');
      if (numericText.length <= 2) {
        setHourInput(numericText);
        // Validate and update if valid
        const hourNum = parseInt(numericText) || 0;
        if (numericText.length === 2 || (numericText.length === 1 && hourNum > 2)) {
          const validHour = Math.min(23, Math.max(0, hourNum));
          const formattedHour = validHour.toString().padStart(2, '0');
          setHourInput(formattedHour);
          onChange(`${formattedHour}:${minuteInput.padStart(2, '0')}`);
        }
      }
    };

    const handleMinuteChange = (text: string) => {
      // Only allow numbers
      const numericText = text.replace(/[^0-9]/g, '');
      if (numericText.length <= 2) {
        setMinuteInput(numericText);
        // Validate and update if valid
        const minuteNum = parseInt(numericText) || 0;
        if (numericText.length === 2 || (numericText.length === 1 && minuteNum > 5)) {
          const validMinute = Math.min(59, Math.max(0, minuteNum));
          const formattedMinute = validMinute.toString().padStart(2, '0');
          setMinuteInput(formattedMinute);
          onChange(`${hourInput.padStart(2, '0')}:${formattedMinute}`);
        }
      }
    };

    const handleHourBlur = () => {
      const hourNum = parseInt(hourInput) || 0;
      const validHour = Math.min(23, Math.max(0, hourNum));
      const formattedHour = validHour.toString().padStart(2, '0');
      setHourInput(formattedHour);
      onChange(`${formattedHour}:${minuteInput.padStart(2, '0')}`);
    };

    const handleMinuteBlur = () => {
      const minuteNum = parseInt(minuteInput) || 0;
      const validMinute = Math.min(59, Math.max(0, minuteNum));
      const formattedMinute = validMinute.toString().padStart(2, '0');
      setMinuteInput(formattedMinute);
      onChange(`${hourInput.padStart(2, '0')}:${formattedMinute}`);
    };

    // Update local state when value prop changes
    useEffect(() => {
      const [h, m] = value.split(':');
      setHourInput(h);
      setMinuteInput(m);
    }, [value]);

    return (
      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerLabel}>{label}</Text>
        <View style={styles.timeInputRow}>
          <View style={styles.timeInputWrapper}>
            <TextInput
              style={styles.timeInput}
              value={hourInput}
              onChangeText={handleHourChange}
              onBlur={handleHourBlur}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#999"
              selectTextOnFocus
            />
            <Text style={styles.timeInputLabel}>Hour</Text>
          </View>
          <Text style={styles.timeInputColon}>:</Text>
          <View style={styles.timeInputWrapper}>
            <TextInput
              style={styles.timeInput}
              value={minuteInput}
              onChangeText={handleMinuteChange}
              onBlur={handleMinuteBlur}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#999"
              selectTextOnFocus
            />
            <Text style={styles.timeInputLabel}>Minute</Text>
          </View>
        </View>
      </View>
    );
  };

  // Mini calendar date picker component for event modal
  const MiniCalendarPicker = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(datePickerMonth);
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const navigatePickerMonth = (direction: number) => {
      const newDate = new Date(datePickerMonth);
      newDate.setMonth(newDate.getMonth() + direction);
      setDatePickerMonth(newDate);
    };

    const selectDate = (day: number) => {
      const newDate = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth(), day);
      setSelectedDate(newDate);
      setShowDatePicker(false);
    };

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.miniCalendarDay} />);
    }
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth(), day);
      const isSelected = formatDate(date) === formatDate(selectedDate);
      const isToday = formatDate(date) === formatDate(new Date());

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.miniCalendarDay,
            isToday && styles.miniCalendarDayToday,
            isSelected && styles.miniCalendarDaySelected,
          ]}
          onPress={() => selectDate(day)}
        >
          <Text style={[
            styles.miniCalendarDayText,
            isToday && styles.miniCalendarDayTextToday,
            isSelected && styles.miniCalendarDayTextSelected,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.miniCalendarContainer}>
        <View style={styles.miniCalendarHeader}>
          <TouchableOpacity onPress={() => navigatePickerMonth(-1)} style={styles.miniCalendarNav}>
            <Ionicons name="chevron-back" size={20} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.miniCalendarTitle}>
            {datePickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigatePickerMonth(1)} style={styles.miniCalendarNav}>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.miniCalendarWeekDays}>
          {weekDays.map((day, idx) => (
            <Text key={idx} style={styles.miniCalendarWeekDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.miniCalendarGrid}>
          {days}
        </View>
        <TouchableOpacity
          style={styles.miniCalendarCloseButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.miniCalendarCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render header with navigation
  const renderHeader = () => {
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={syncToPhoneCalendar} style={styles.syncButton}>
              <Ionicons name="sync" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* View mode toggle */}
        <View style={styles.viewModeContainer}>
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => {
              if (viewMode === 'month') navigateMonth(-1);
              else if (viewMode === 'week') navigateWeek(-1);
              else navigateDay(-1);
            }}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>

          <Text style={styles.navTitle}>
            {viewMode === 'day'
              ? formatDisplayDate(selectedDate)
              : monthYear
            }
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (viewMode === 'month') navigateMonth(1);
              else if (viewMode === 'week') navigateWeek(1);
              else navigateDay(1);
            }}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get events for current month
  const getMonthEvents = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (!a.time) return -1;
      if (!b.time) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [events, currentDate]);

  // Render month view
  const renderMonthView = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthEvents = getMonthEvents();

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = formatDate(date) === formatDate(selectedDate);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => handleDayClick(date)}
        >
          <Text style={[
            styles.dayNumber,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
          ]}>
            {day}
          </Text>
          {dayEvents.length > 0 && (
            <View style={styles.eventDotsContainer}>
              {dayEvents.slice(0, 3).map((event, idx) => (
                <View
                  key={idx}
                  style={[styles.eventDot, { backgroundColor: getEventColor(event.eventType || event.event_type) }]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView
        style={styles.monthScrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B2332']}
            tintColor="#8B2332"
          />
        }
      >
        <View style={styles.monthContainer}>
          <View style={styles.weekDaysRow}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {days}
          </View>
        </View>

        {/* Events list for the month */}
        <View style={styles.monthEventsContainer}>
          <Text style={styles.monthEventsTitle}>Events This Month</Text>
          {monthEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.noEventsText}>No events this month</Text>
              <Text style={styles.noEventsSubtext}>Tap + to add an event</Text>
            </View>
          ) : (
            monthEvents.map(event => {
              const eventDate = new Date(event.date || event.event_date);
              const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = eventDate.getDate();
              const isAllDay = event.isAllDay || event.is_all_day;
              const eventTime = event.time || event.event_time;
              const eventEndTime = event.endTime || event.end_time;
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.monthEventItem}
                  onPress={() => openEditEventModal(event)}
                >
                  <View style={styles.monthEventDate}>
                    <Text style={styles.monthEventDay}>{dayOfWeek}</Text>
                    <Text style={styles.monthEventDayNum}>{dayNum}</Text>
                  </View>
                  <View style={[styles.monthEventColor, { backgroundColor: getEventColor(event.eventType || event.event_type) }]} />
                  <View style={styles.monthEventInfo}>
                    <Text style={styles.monthEventTitle}>{event.title}</Text>
                    <Text style={styles.monthEventTime}>
                      {isAllDay ? 'All Day' : `${eventTime || ''}${eventEndTime ? ` - ${eventEndTime}` : ''}`}
                    </Text>
                    {event.location && (
                      <Text style={styles.monthEventLocation}>📍 {event.location}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Check if there are any all-day events this week
    const hasAllDayEvents = weekDates.some(date =>
      getEventsForDate(date).some(e => {
        const isAllDay = e.isAllDay || e.is_all_day;
        const hasTime = e.time || e.event_time;
        return isAllDay || !hasTime;
      })
    );

    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          {weekDates.map((date, idx) => {
            const isToday = formatDate(date) === formatDate(new Date());
            const isSelected = formatDate(date) === formatDate(selectedDate);
            const dayEvents = getEventsForDate(date);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.weekDayCell, isSelected && styles.weekDayCellSelected]}
                onPress={() => handleDayClick(date)}
              >
                <Text style={styles.weekDayName}>{weekDays[idx]}</Text>
                <View style={[styles.weekDayNumber, isToday && styles.weekDayNumberToday]}>
                  <Text style={[styles.weekDayNumberText, isToday && styles.weekDayNumberTextToday]}>
                    {date.getDate()}
                  </Text>
                </View>
                {dayEvents.length > 0 && (
                  <View style={styles.weekDayDots}>
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <View key={i} style={[styles.weekDayDot, { backgroundColor: getEventColor(e.eventType || e.event_type) }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* All-day events section */}
        {hasAllDayEvents && (
          <View style={styles.weekAllDaySection}>
            <Text style={styles.weekAllDayLabel}>All Day</Text>
            <View style={styles.weekAllDayRow}>
              {weekDates.map((date, idx) => {
                const allDayEvents = getEventsForDate(date).filter(e => {
                  const isAllDay = e.isAllDay || e.is_all_day;
                  const hasTime = e.time || e.event_time;
                  return isAllDay || !hasTime;
                });
                return (
                  <View key={idx} style={styles.weekAllDayCell}>
                    {allDayEvents.map((event, eventIdx) => (
                      <TouchableOpacity
                        key={eventIdx}
                        style={[styles.weekAllDayEvent, { backgroundColor: getEventColor(event.eventType || event.event_type) }]}
                        onPress={() => openEditEventModal(event)}
                      >
                        <Text style={styles.weekAllDayEventText} numberOfLines={1}>
                          {event.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <ScrollView
          style={styles.weekBody}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B2332']}
              tintColor="#8B2332"
            />
          }
        >
          {Array.from({ length: 24 }, (_, hour) => (
            <View key={hour} style={styles.weekTimeRow}>
              <Text style={styles.weekTimeLabel}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.weekTimeSlots}>
                {weekDates.map((date, dayIdx) => {
                  const dayEvents = getEventsForDate(date).filter(e => {
                    if (e.isAllDay || e.is_all_day) return false;
                    const eventTime = e.time || e.event_time;
                    if (!eventTime) return false;
                    const eventHour = parseInt(eventTime.split(':')[0] || '0');
                    return eventHour === hour;
                  });
                  return (
                    <TouchableOpacity
                      key={dayIdx}
                      style={styles.weekTimeSlot}
                      onPress={() => {
                        setSelectedDate(date);
                        setStartTime(`${hour.toString().padStart(2, '0')}:00`);
                        setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
                        setIsAllDay(false);
                        openAddEventModal(date);
                      }}
                    >
                      {dayEvents.map((event, idx) => {
                        const eventTime = event.time || event.event_time;
                        const eventEndTime = event.endTime || event.end_time;
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.weekEventBlock, { backgroundColor: getEventColor(event.eventType || event.event_type) }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              openEditEventModal(event);
                            }}
                          >
                            <Text style={styles.weekEventBlockTitle} numberOfLines={1}>
                              {event.title}
                            </Text>
                            <Text style={styles.weekEventBlockTime} numberOfLines={1}>
                              {eventTime}{eventEndTime ? `-${eventEndTime}` : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Add event FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => openAddEventModal()}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render day view
  const renderDayView = () => {
    const timeSlots = getTimeSlots(selectedDate);
    const allDayEvents = getAllDayEvents(selectedDate);

    return (
      <View style={styles.dayContainer}>
        {/* All-day events section */}
        {allDayEvents.length > 0 && (
          <View style={styles.allDaySection}>
            <Text style={styles.allDayLabel}>All Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allDayEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.allDayEvent, { backgroundColor: getEventColor(event.eventType || event.event_type) }]}
                  onPress={() => openEditEventModal(event)}
                >
                  <Text style={styles.allDayEventText}>{event.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Time slots */}
        <ScrollView
          style={styles.dayTimeSlots}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B2332']}
              tintColor="#8B2332"
            />
          }
        >
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot.hour}
              style={styles.dayTimeRow}
              onPress={() => {
                setStartTime(`${slot.hour.toString().padStart(2, '0')}:00`);
                setEndTime(`${(slot.hour + 1).toString().padStart(2, '0')}:00`);
                setIsAllDay(false);
                openAddEventModal();
              }}
            >
              <Text style={styles.dayTimeLabel}>
                {slot.hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.dayTimeContent}>
                {slot.events.map(event => {
                  const eventTime = event.time || event.event_time;
                  const eventEndTime = event.endTime || event.end_time;
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.dayEventBlock, { backgroundColor: getEventColor(event.eventType || event.event_type) }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openEditEventModal(event);
                      }}
                    >
                      <View style={styles.dayEventBlockHeader}>
                        <Text style={styles.dayEventBlockTitle}>{event.title}</Text>
                        <Text style={styles.dayEventBlockTime}>
                          {eventTime} - {eventEndTime || '...'}
                        </Text>
                      </View>
                      {event.location && (
                        <Text style={styles.dayEventBlockLocation}>📍 {event.location}</Text>
                      )}
                      {event.description && (
                        <Text style={styles.dayEventBlockDesc} numberOfLines={1}>{event.description}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add event FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => openAddEventModal()}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Get event color based on type
  const getEventColor = (type?: string) => {
    switch (type) {
      case 'date': return '#e91e63';
      case 'anniversary': return '#9c27b0';
      case 'reminder': return '#ff9800';
      default: return '#8B2332';
    }
  };

  // Render event modal
  const renderEventModal = () => (
    <Modal
      visible={showEventModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEventModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedEvent ? 'Edit Event' : 'New Event'}
            </Text>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event title"
              placeholderTextColor={theme.textLight}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={eventDescription}
              onChangeText={setEventDescription}
              placeholder="Add description"
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={eventLocation}
              onChangeText={setEventLocation}
              placeholder="Add location"
              placeholderTextColor={theme.textLight}
            />

            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                setDatePickerMonth(selectedDate);
                setShowDatePicker(!showDatePicker);
              }}
            >
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <Text style={styles.datePickerButtonText}>{formatDisplayDate(selectedDate)}</Text>
              <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color={theme.primary} />
            </TouchableOpacity>

            {/* Mini Calendar Picker */}
            {showDatePicker && <MiniCalendarPicker />}

            {/* All Day Toggle */}
            <View style={styles.allDayContainer}>
              <TouchableOpacity
                style={styles.allDayToggle}
                onPress={() => setIsAllDay(!isAllDay)}
              >
                <View style={[styles.checkbox, isAllDay && styles.checkboxChecked]}>
                  {isAllDay && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.allDayToggleText}>All Day</Text>
              </TouchableOpacity>
              <Text style={styles.allDayHint}>
                {isAllDay
                  ? 'Uncheck to set specific start and end times'
                  : 'Check to make this an all-day event'}
              </Text>
            </View>

            {/* Time pickers (only if not all day) */}
            {!isAllDay && (
              <View style={styles.timeSection}>
                <Text style={styles.timeSectionHint}>
                  Select hour and minute for precise timing
                </Text>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  label="Start Time"
                />
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  label="End Time"
                />
              </View>
            )}

            {/* Event Type */}
            <Text style={styles.inputLabel}>Event Type</Text>
            <View style={styles.eventTypeContainer}>
              {(['date', 'anniversary', 'reminder', 'other'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    eventType === type && { backgroundColor: getEventColor(type) }
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text style={[
                    styles.eventTypeText,
                    eventType === type && styles.eventTypeTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            {selectedEvent && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
              <Text style={styles.saveButtonText}>
                {selectedEvent ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </View>

      {/* Add button for month view */}
      {viewMode === 'month' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => openAddEventModal()}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {renderEventModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8e5e8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B2332',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8e5e8',
  },
  todayButtonText: {
    color: '#8B2332',
    fontWeight: '500',
  },
  syncButton: {
    padding: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#8B2332',
  },
  viewModeText: {
    color: '#8B2332',
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  // Month view styles
  monthScrollContainer: {
    flex: 1,
  },
  monthContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  todayCell: {
    backgroundColor: 'rgba(139, 35, 50, 0.1)',
  },
  selectedCell: {
    backgroundColor: '#8B2332',
  },
  dayNumber: {
    fontSize: 16,
    color: '#333',
  },
  todayText: {
    fontWeight: '600',
    color: '#8B2332',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Month events list styles
  monthEventsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 80,
  },
  monthEventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  monthEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  monthEventDate: {
    width: 45,
    alignItems: 'center',
  },
  monthEventDay: {
    fontSize: 12,
    color: '#666',
  },
  monthEventDayNum: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  monthEventColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  monthEventInfo: {
    flex: 1,
  },
  monthEventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  monthEventTime: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  monthEventLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  // Week view styles
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayCellSelected: {
    backgroundColor: 'rgba(139, 35, 50, 0.1)',
    borderRadius: 8,
  },
  weekDayName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  weekDayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayNumberToday: {
    backgroundColor: '#8B2332',
  },
  weekDayNumberText: {
    fontSize: 14,
    color: '#333',
  },
  weekDayNumberTextToday: {
    color: '#fff',
    fontWeight: '600',
  },
  weekDayDots: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  weekDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  weekAllDaySection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
    paddingVertical: 8,
  },
  weekAllDayLabel: {
    fontSize: 10,
    color: '#666',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  weekAllDayRow: {
    flexDirection: 'row',
    paddingLeft: 50,
  },
  weekAllDayCell: {
    flex: 1,
    paddingHorizontal: 2,
  },
  weekAllDayEvent: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  weekAllDayEventText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  weekBody: {
    flex: 1,
  },
  weekTimeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  weekTimeLabel: {
    width: 50,
    paddingVertical: 16,
    paddingHorizontal: 4,
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  weekTimeSlots: {
    flex: 1,
    flexDirection: 'row',
  },
  weekTimeSlot: {
    flex: 1,
    minHeight: 50,
    borderLeftWidth: 1,
    borderLeftColor: '#f5c8d2',
    padding: 2,
  },
  weekEvent: {
    padding: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  weekEventText: {
    fontSize: 10,
    color: '#fff',
  },
  weekEventBlock: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
    minHeight: 44,
  },
  weekEventBlockTitle: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  weekEventBlockTime: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Day view styles
  dayContainer: {
    flex: 1,
  },
  allDaySection: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  allDayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  allDayEvent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  allDayEventText: {
    color: '#fff',
    fontWeight: '500',
  },
  dayTimeSlots: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayTimeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
    minHeight: 60,
  },
  dayTimeLabel: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#666',
  },
  dayTimeContent: {
    flex: 1,
    paddingVertical: 4,
    paddingRight: 8,
  },
  dayEvent: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayEventTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dayEventTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  dayEventLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  dayEventBlock: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 50,
  },
  dayEventBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayEventBlockTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  dayEventBlockTime: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  dayEventBlockLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  dayEventBlockDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  // FAB
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c8d2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateDisplayText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f5c8d2',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  // Mini Calendar Picker styles
  miniCalendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f5c8d2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniCalendarNav: {
    padding: 4,
  },
  miniCalendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  miniCalendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  miniCalendarWeekDay: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  miniCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniCalendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCalendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  miniCalendarDayToday: {
    backgroundColor: '#f8e5e8',
    borderRadius: 20,
  },
  miniCalendarDayTextToday: {
    color: '#8B2332',
    fontWeight: '600',
  },
  miniCalendarDaySelected: {
    backgroundColor: '#8B2332',
    borderRadius: 20,
  },
  miniCalendarDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  miniCalendarCloseButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
    alignItems: 'center',
  },
  miniCalendarCloseText: {
    color: '#8B2332',
    fontWeight: '600',
    fontSize: 14,
  },
  allDayContainer: {
    marginTop: 16,
  },
  allDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#8B2332',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B2332',
  },
  allDayToggleText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  allDayHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    marginLeft: 36,
    fontStyle: 'italic',
  },
  timeSection: {
    marginTop: 16,
    gap: 12,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  timeSectionHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputWrapper: {
    alignItems: 'center',
  },
  timeInput: {
    width: 70,
    height: 50,
    borderWidth: 2,
    borderColor: '#8B2332',
    borderRadius: 10,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#fff',
  },
  timeInputLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  timeInputColon: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 12,
    color: '#8B2332',
  },
  // Legacy styles (kept for compatibility)
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timePickerSection: {
    flex: 1,
  },
  timePickerSectionLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  timePickerScroll: {
    flexGrow: 0,
  },
  timePickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8e5e8',
  },
  timePickerItemSelected: {
    backgroundColor: '#8B2332',
  },
  timePickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  timePickerItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timePickerColon: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 8,
    color: '#333',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8e5e8',
  },
  eventTypeText: {
    color: '#333',
    fontWeight: '500',
  },
  eventTypeTextSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5c8d2',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B2332',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
