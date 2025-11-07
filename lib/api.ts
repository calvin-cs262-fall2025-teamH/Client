// Client/lib/api.ts
import * as SecureStore from "expo-secure-store";


export const BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://153.106.86.63:4000";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function http<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  async register(email: string, password: string) {
    const data = await http<{ token: string; user: { id: number; email: string } }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (data.token) await saveToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await http<{ token: string; user: { id: number; email: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (data.token) await saveToken(data.token);
    return data;
  },

  async me() {
    const token = await getToken();
    if (!token) throw new Error("No token");
    return http<{ user: { id: number; email: string } }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout: clearToken,
};
