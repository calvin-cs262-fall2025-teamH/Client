// API Configuration
// Change this to your computer's IP address when running on mobile devices
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const DEFAULT_BASE = __DEV__
  ? (isWeb ? 'http://localhost:4000' : 'http://153.106.82.231:4000')  // Your computer's IP address (no /api suffix)
  : 'https://your-production-api.com'; // For production

  export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE || DEFAULT_BASE;

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
