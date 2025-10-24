# Setup Instructions

## For Teammates: Running on Your Device

### 1. Pull the Code
```bash
git pull
```

### 2. Install Dependencies

**Client:**
```bash
cd Client
npm install
```

**Service:**
```bash
cd Service
npm install
```

### 3. Configure Your IP Address

**a) Find your computer's IP address:**
- **Windows:** Open PowerShell and run `ipconfig`, look for "IPv4 Address"
- **Mac/Linux:** Run `ifconfig` or `ip addr`, look for your local IP

**b) Create your config file:**
```bash
cd Client
cp config.example.ts config.ts    # Mac/Linux
copy config.example.ts config.ts  # Windows
```

**c) Update the config file:**
- Open `Client/config.ts`
- Replace `YOUR_IP_ADDRESS_HERE` with YOUR computer's IP address:
```typescript
export const API_URL = 'http://192.168.1.100:3000';  // Use your actual IP
```

> **Note:** `config.ts` is in `.gitignore` so your personal IP won't be committed to GitHub

### 4. Start the Service (Backend)
```bash
cd Service
npm run dev
```
You should see: `Server running on port 3000`

### 5. Start the Client (Mobile App)
```bash
cd Client
npx expo start
```

### 6. Run on Your Phone
1. Install **Expo Go** app on your phone (from App Store or Google Play)
2. Make sure your phone and computer are on the **same WiFi network**
3. Scan the QR code shown in the terminal with:
   - **iPhone:** Camera app
   - **Android:** Expo Go app

## Troubleshooting

### "Network request failed"
- Ensure your phone and computer are on the same WiFi
- Make sure you created `Client/config.ts` from `config.example.ts`
- Update `Client/config.ts` with your computer's IP address
- Check if Service is running on port 3000

### Port already in use
**Service (port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>

# Mac/Linux
lsof -ti:3000 | xargs kill
```

**Expo (port 8081):**
```bash
npx expo start --clear
```

### Login not working
- Users are stored in memory, so they're lost when Service restarts
- Register a new account after restarting the Service

### Missing config.ts
If you see an error about `config.ts` not found:
```bash
cd Client
cp config.example.ts config.ts    # Then edit config.ts with your IP
```
