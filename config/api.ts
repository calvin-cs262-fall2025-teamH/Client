// API Configuration
// Change this to your computer's IP address when running on mobile devices
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.0.137:3000'  // Your computer's IP address
  : 'https://your-production-api.com'; // For production

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
