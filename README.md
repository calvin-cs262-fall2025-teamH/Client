# Client

Mobile application client built with React Native and Expo.

## Related Repositories
- [Service Repository](https://github.com/calvin-cs262-fall2025-teamH/Service)
- [Project Repository](https://github.com/calvin-cs262-fall2025-teamH/Project)

## Tech Stack
- React Native
- Expo
- TypeScript
- Firebase (for configuration)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

Create a `firebaseConfig.js` file in the Client folder (or copy from `config.example.ts`):

```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

**Ask your team lead for the actual Firebase credentials.**

### 3. Update API Configuration

**Important:** You need to update the API URL to point to your local machine's IP address.

1. Find your computer's IP address:
   - Windows: Run `ipconfig` in terminal, look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig`, look for your network interface

2. Edit `Client/config/api.ts`:
```typescript
const DEFAULT_BASE = __DEV__
  ? (isWeb ? 'http://localhost:4000' : 'http://YOUR_IP_ADDRESS:4000')  // Replace with your IP
  : 'https://your-production-api.com';
```

Example: `'http://192.168.1.100:4000'`

### 4. Make Sure the Service is Running

Before starting the client, make sure the backend service is running:
```bash
cd ../Service
npm run dev
```

### 5. Start the Client

```bash
npx expo start
```

### 6. Run on Device

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web**: Press `w`
- **Physical Device**: Scan QR code with Expo Go app

## Important Notes

### Network Configuration
- Your phone/emulator must be on the **same WiFi network** as your computer running the service
- **Each team member runs their own backend server locally** - you don't need to connect to each other's servers
- All team members connect to the **same Azure database** (shared data)
- If using a physical device, make sure your firewall allows connections on port 4000
- If the API isn't connecting, double-check your IP address in `config/api.ts`

### Environment
The app uses different API URLs based on the platform:
- **Web**: Uses `http://localhost:4000`
- **Mobile**: Uses your computer's IP address (e.g., `http://192.168.1.100:4000`)

## Common Issues

### "Network request failed"
- Check that the Service is running (`npm run dev` in Service folder)
- Verify your IP address in `config/api.ts` matches your current IP
- Make sure your phone and computer are on the same WiFi

### "Unable to connect to development server"
- Try restarting the Expo dev server
- Clear Expo cache: `npx expo start -c`

### Firebase errors
- Make sure `firebaseConfig.js` exists and has valid credentials
- Ask team lead for the Firebase configuration if you don't have it