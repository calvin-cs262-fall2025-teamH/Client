// API Configuration
// Change this to your computer's IP address when running on mobile devices
const isWeb = typeof window !== 'undefined';
const DEFAULT_BASE = __DEV__ 
  ? (isWeb ? 'http://localhost:4000/api' : 'http://192.168.1.86:4000/api')  // Your computer's IP address
  : 'https://your-production-api.com'; // For production

  export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE || DEFAULT_BASE;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`,
  }
};

export default API_BASE_URL;
