// Client/types/api.ts
/**
 * CoupleBond API Type Definitions
 */

// ============= Base Response Types =============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============= User Types =============
export interface User {
  id: number;
  email: string;
  name?: string;
  coupleId?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============= Couple Types =============
export interface Couple {
  coupleId: number;
  inviteCode: string;
  hasPartner: boolean;
  partner?: {
    email: string;
    name?: string;
  };
  createdAt: string;
}

export interface CreateCoupleResponse {
  coupleId: number;
  inviteCode: string;
  createdAt: string;
}

// ============= Activity Types =============
export interface Activity {
  id: number;
  coupleId: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  photoCount?: number;
  createdAt: string;
}

export interface ActivityWithPhotos extends Activity {
  photos: Photo[];
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  date: string;
  location?: string;
}

// ============= Photo Types =============
export interface Photo {
  id: number;
  photoUrl: string;
  caption?: string;
  createdAt: string;
}

export interface AddPhotoRequest {
  photoUrl: string;
  caption?: string;
}

// ============= Calendar Types =============
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  event_date?: string;
  time?: string | null;
  event_time?: string | null;
  isAllDay?: boolean;
  is_all_day?: boolean;
  eventType?: string;
  event_type?: string;
  location?: string | null;
  addedBy?: number;
  added_by_user_id?: number;
  addedByName?: string;
  added_by_name?: string;
  createdAt?: string;
  created_at?: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  isAllDay?: boolean;
  eventType?: string;
  location?: string | null;
}

export interface Anniversary {
  startDate: string;
  daysTogether: number;
  monthsTogether: number;
  yearsTogether: number;
  nextMonthAnniversary: string;
  nextYearAnniversary: string;
}

// ============= Anniversary Reminder Types =============
export interface AnniversaryReminder {
  id: number;
  coupleId: number;
  title: string;
  description?: string;
  anniversaryDate: string;
  reminderDaysBefore: number;
  isRecurring: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnniversaryReminderRequest {
  title: string;
  description?: string;
  anniversaryDate: string;
  reminderDaysBefore: number;
  isRecurring?: boolean;
}

export interface UpdateAnniversaryReminderRequest {
  title?: string;
  description?: string;
  anniversaryDate?: string;
  reminderDaysBefore?: number;
  isRecurring?: boolean;
  isEnabled?: boolean;
}

// ============= Prayer Types =============
export interface PrayerItem {
  id: number;
  coupleId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isAnswered: boolean;
  answeredAt?: string | null;
}

export interface CreatePrayerRequest {
  title: string;
  content: string;
}

export interface UpdatePrayerRequest {
  title?: string;
  content?: string;
}

// ============= Timeline Types =============
export interface TimelineActivity {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  createdAt: string;
  photos: Photo[];
}

// ============= Devotional Types =============
export interface DevotionalPlan {
  id: number;
  day_number: number;
  title: string;
  reference: string;
  scripture_text: string;
  reflection_question?: string;
  is_completed: boolean;
  completed_at?: string;
  is_custom?: boolean;
}

export interface ToggleDevotionalResponse {
  isCompleted: boolean;
}
