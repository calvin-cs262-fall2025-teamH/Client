// Client/lib/api.ts
import type {
  Activity,
  ActivityWithPhotos,
  AddPhotoRequest,
  Anniversary,
  AnniversaryReminder,
  ApiResponse,
  AuthResponse,
  CalendarEvent,
  Couple,
  CreateActivityRequest,
  CreateAnniversaryReminderRequest,
  CreateCalendarEventRequest,
  CreateCoupleResponse,
  CreatePrayerRequest,
  DevotionalPlan,
  Photo,
  PrayerItem,
  TimelineActivity,
  ToggleDevotionalResponse,
  UpdateAnniversaryReminderRequest,
  UpdatePrayerRequest,
} from "@/types/api";
import * as SecureStore from "expo-secure-store";

export const BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://153.106.94.158:4000";

console.log('[api] BASE URL configured as:', BASE);

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  // Verify the token was saved
  const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!savedToken) {
    throw new Error('Failed to save authentication token');
  }
  console.log('[saveToken] Token saved and verified successfully');
}

export async function getToken() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  console.log('[getToken] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function http<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    console.log(`[http] Fetching: ${BASE}${path}`);
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    clearTimeout(timeoutId);

    console.log(`[http] Response status: ${res.status} for ${path}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    }
    return data as ApiResponse<T>;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[http] Request timeout after 30s for ${path}`);
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    console.error(`[http] Fetch error for ${path}:`, error.message);
    throw error;
  }
}

/* The `authHttp` function is a helper function used to make authenticated HTTP requests to the API.
Here's a breakdown of what it does: */
async function authHttp<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = await getToken();
  if (!token) {
    console.error('[authHttp] No token found - user may not be logged in');
    console.error('[authHttp] Path attempted:', path);
    throw new Error("Authentication required. Please log in again.");
  }
  console.log(`[authHttp] Calling ${path} with method: ${options.method || 'GET'}`);
  console.log(`[authHttp] Full URL: ${BASE}${path}`);
  console.log(`[authHttp] Token exists: ${!!token}, length: ${token?.length}`);

  try {
    const startTime = Date.now();
    const result = await http<T>(path, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - startTime;
    console.log(`[authHttp] Success for ${path} in ${elapsed}ms:`, result);
    return result;
  } catch (error: unknown) {
    console.error(`[authHttp] Error for ${path}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export const api = {
  // ============= Auth APIs =============
  async register(email: string, password: string) {
    const response = await http<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) await saveToken(response.data.token);
    return response.data!;
  },

  async login(email: string, password: string) {
    const response = await http<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) await saveToken(response.data.token);
    return response.data!;
  },

  async me() {
    return authHttp<{ id: number; email: string }>("/api/auth/me");
  },

  logout: clearToken,

  // ============= User/Partner APIs =============
  async getProfile() {
    return authHttp<{
      id: number;
      email: string;
      name: string | null;
      coupleId: number | null;
      hasPartner: boolean;
      partner: { id: number; email: string; name: string | null } | null;
      createdAt: string;
      dateOfBirth: string | null;
      major: string | null;
      year: string | null;
      hobby: string | null;
    }>("/api/user/profile");
  },

  async updateProfile(data: {
    name?: string;
    dateOfBirth?: string;
    major?: string;
    year?: string;
    hobby?: string;
  }) {
    return authHttp<Record<string, unknown>>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async generatePairingCode() {
    return authHttp<{ code: string; expiresAt: string }>("/api/user/partner/generate-code", {
      method: "POST",
    });
  },

  async connectWithPartner(partnerCode: string) {
    return authHttp<{ coupleId: number }>("/api/user/partner/connect", {
      method: "POST",
      body: JSON.stringify({ partnerCode }),
    });
  },

  async getPartner() {
    return authHttp<{
      coupleId: number | null;
      hasPartner: boolean;
      partner: { id: number; email: string; name: string | null } | null;
      connectedAt: string | null;
    }>("/api/user/partner");
  },

  async unmatchPartner() {
    return authHttp<void>("/api/user/partner/unmatch", {
      method: "DELETE",
    });
  },

  // ============= Couple APIs =============
  async createCouple() {
    return authHttp<CreateCoupleResponse>("/api/couple/create", {
      method: "POST",
    });
  },

  async joinCouple(inviteCode: string) {
    return authHttp<{ coupleId: number }>("/api/couple/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
  },

  async getMyCouple() {
    return authHttp<Couple | null>("/api/couple/me");
  },

  async leaveCouple() {
    return authHttp<void>("/api/couple/leave", {
      method: "DELETE",
    });
  },

  // ============= Activity APIs =============
  async createActivity(data: CreateActivityRequest) {
    return authHttp<Activity>("/api/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getActivities() {
    return authHttp<Activity[]>("/api/activities");
  },

  async getActivity(id: number) {
    return authHttp<ActivityWithPhotos>(`/api/activities/${id}`);
  },

  async deleteActivity(id: number) {
    return authHttp<void>(`/api/activities/${id}`, {
      method: "DELETE",
    });
  },

  async addPhoto(activityId: number, data: AddPhotoRequest) {
    return authHttp<Photo>(`/api/activities/${activityId}/photos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTimeline() {
    return authHttp<TimelineActivity[]>("/api/activities/timeline/all");
  },

  // ============= Calendar APIs =============
  async createCalendarEvent(data: CreateCalendarEventRequest) {
    return authHttp<CalendarEvent>("/api/calendar/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getCalendarEvents() {
    return authHttp<CalendarEvent[]>("/api/calendar/events");
  },

  async getUpcomingEvents() {
    return authHttp<CalendarEvent[]>("/api/calendar/upcoming");
  },

  async getAnniversaries() {
    return authHttp<Anniversary>("/api/calendar/anniversaries");
  },

  async updateCalendarEvent(id: number, data: CreateCalendarEventRequest) {
    return authHttp<CalendarEvent>(`/api/calendar/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCalendarEvent(id: number) {
    return authHttp<void>(`/api/calendar/events/${id}`, {
      method: "DELETE",
    });
  },

  // ============= Prayer APIs =============
  async createPrayer(data: CreatePrayerRequest) {
    return authHttp<PrayerItem>("/api/prayers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getPrayers() {
    return authHttp<PrayerItem[]>("/api/prayers");
  },

  async getPrayer(id: number) {
    return authHttp<PrayerItem>(`/api/prayers/${id}`);
  },

  async updatePrayer(id: number, data: UpdatePrayerRequest) {
    return authHttp<PrayerItem>(`/api/prayers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePrayer(id: number) {
    return authHttp<void>(`/api/prayers/${id}`, {
      method: "DELETE",
    });
  },

  async togglePrayerAnswered(id: number) {
    return authHttp<PrayerItem>(`/api/prayers/${id}/toggle-answered`, {
      method: "PUT",
    });
  },

  // ============= Anniversary Reminder APIs =============
  async createAnniversaryReminder(data: CreateAnniversaryReminderRequest) {
    return authHttp<AnniversaryReminder>("/api/anniversary-reminders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAnniversaryReminders() {
    return authHttp<AnniversaryReminder[]>("/api/anniversary-reminders");
  },

  async getUpcomingAnniversaryReminders() {
    return authHttp<AnniversaryReminder[]>("/api/anniversary-reminders/upcoming");
  },

  async getAnniversaryReminder(id: number) {
    return authHttp<AnniversaryReminder>(`/api/anniversary-reminders/${id}`);
  },

  async updateAnniversaryReminder(id: number, data: UpdateAnniversaryReminderRequest) {
    return authHttp<AnniversaryReminder>(`/api/anniversary-reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAnniversaryReminder(id: number) {
    return authHttp<void>(`/api/anniversary-reminders/${id}`, {
      method: "DELETE",
    });
  },

  async toggleAnniversaryReminderEnabled(id: number) {
    return authHttp<AnniversaryReminder>(`/api/anniversary-reminders/${id}/toggle`, {
      method: "PUT",
    });
  },

  // ============= Devotional APIs =============
  async getDevotionals(category: 'couple' | 'year' = 'couple') {
    return authHttp<DevotionalPlan[]>(`/api/devotionals?category=${category}`);
  },

  async toggleDevotional(id: number) {
    return authHttp<ToggleDevotionalResponse>(`/api/devotionals/${id}/toggle`, {
      method: "POST",
    });
  },

  async toggleCustomDevotional(dayId: number) {
    return authHttp<ToggleDevotionalResponse>(`/api/devotionals/custom/${dayId}/toggle`, {
      method: "POST",
    });
  },

  async saveCustomPlan(data: { start_book: string; start_chapter: number; end_book: string; end_chapter: number; chapters_per_day: number }) {
    return authHttp<{ success: boolean; message: string }>("/api/devotionals/custom", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

};
