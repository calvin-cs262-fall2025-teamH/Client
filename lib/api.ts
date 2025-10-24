
// export const BASE = "http://192.168.1.23:4000";
export const BASE = process.env.EXPO_PUBLIC_API_BASE || "http://192.168.1.23:4000";

import * as SecureStore from "expo-secure-store";

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

// Generic helpers
async function post<T = any>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed: ${res.status}`);
  return data as T;
}

async function get<T = any>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed: ${res.status}`);
  return data as T;
}

// API surface aligned with your server (/auth/*)
export const api = {
  register: (email: string, password: string) =>
    post<{ token: string; user?: { id: string; email: string } }>("/auth/register", { email, password }),

  login: async (email: string, password: string) => {
    const data = await post<{ token: string; user?: { id: string; email: string } }>("/auth/login", {
      email,
      password,
    });
    if (data?.token) await saveToken(data.token);
    return data;
  },

  me: async () => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    return get<{ user: { id: string; email: string } }>("/auth/me", token);
  },

  logout: () => clearToken(),
};
