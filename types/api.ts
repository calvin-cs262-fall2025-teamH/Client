// Client/types/api.ts
/**
 * CoupleBond API Type Definitions
 */

// ============= Base Response Types =============
export interface ApiResponse<T = any> {
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
  activityId: number;
  date: string;
  title: string;
  location?: string;
  activityTitle?: string;
  activityDescription?: string;
  createdAt: string;
}

export interface CreateCalendarEventRequest {
  activityId: number;
  date: string;
  title: string;
  location?: string;
}

export interface Anniversary {
  startDate: string;
  daysTogether: number;
  monthsTogether: number;
  yearsTogether: number;
  nextMonthAnniversary: string;
  nextYearAnniversary: string;
}

// ============= Prayer Types =============
export interface PrayerItem {
  id: number;
  coupleId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
