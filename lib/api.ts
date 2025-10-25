// Client/lib/api.ts
import * as SecureStore from "expo-secure-store";

// 注意：统一包含 /api 前缀！
// 开发时用本机 IP（非 127.0.0.1），手机真机才能访问你的电脑
export const BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://localhost:4000/api";

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
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (data.token) await saveToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await http<{ token: string; user: { id: number; email: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (data.token) await saveToken(data.token);
    return data;
  },

  async me() {
    const token = await getToken();
    if (!token) throw new Error("No token");
    return http<{ user: { id: number; email: string } }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout: clearToken,
};
