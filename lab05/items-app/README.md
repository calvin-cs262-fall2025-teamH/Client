# Props Demo App 📱

A simple two-screen Expo TypeScript application demonstrating props-based state
 management. This app displays a list of items and allows users to view details
 and delete items.

## Project Structure

   ```console
   props-app/
   ├── app/                 # Expo Router screens
   │   ├── _layout.tsx      # Root layout with navigation and state
   │   ├── index.tsx        # Item list screen
   │   └── details.tsx      # Item details screen
   ├── types/               # TypeScript type definitions
   │   └── Item.tsx         # Item interface and defaults
   ├── styles/              # Shared styling
   │   └── common.ts        # Common style definitions
   ├── data/                # Static data files
   │   └── items.json       # Initial item data
   └── README.md            # This file
   ```

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Open the app**
   - Scan the QR code with Expo Go (iOS/Android)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser
