// API Configuration
// Change this to your computer's IP address when running on mobile devices

// Use Platform.OS to reliably detect running on web vs native
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const DEFAULT_BASE = __DEV__
  ? (isWeb ? 'http://localhost:3000/api' : 'http://153.106.215.92:3000/api') // Your computer's IP address for devices
  : 'https://your-production-api.com'; // For production

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE || DEFAULT_BASE;
console.log(">>> Using config/api.ts, API_BASE_URL =", API_BASE_URL);
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/user/profile`,
  }
};

export default API_BASE_URL;
