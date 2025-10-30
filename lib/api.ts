


// Client/lib/
// api.ts
import * as SecureStore from "expo-secure-store";

// 注意：统一包含 /api 前缀！
// 开发时用本机 IP（非 127.0.0.1），手机真机才能访问你的电脑
export const BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://153.106.215.92:3000/api";

console.log(">>> Using lib/api.ts, BASE =", BASE);
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
  const url = `${BASE}${path}`;
  // Log outgoing requests so we can debug network issues on device
  console.log('-> fetch', url, { method: options.method || 'GET' });
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    // Read raw text first so JSON parse errors don't hide the response
    const text = await res.text().catch(() => '');
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { __raw: text };
    }

    if (!res.ok) {
      console.log('<- fetch error', url, res.status, data);
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    console.log('<- fetch ok', url, res.status);
    return data as T;
  } catch (err) {
    // Network request failed - log full context for debugging
    console.log('*** Network error fetching', url, err);
    throw err;
  }
}

export const api = {
  async register(email: string, password: string) {
    console.log('api.register ->', BASE + '/auth/register');
    const data = await http<{ token: string; user: { id: number; email: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (data.token) await saveToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    console.log('api.login ->', BASE + '/auth/login');
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
