# Homework 2 - Items App

This application integrates features from Labs 4-6 to create a comprehensive items management app.

## Features

### Lab 4 Integration - Tabbed UI Design
- **Tabbed Navigation**: Uses Expo Router's tab navigation with two tabs: Items and About
- **About Page**: Displays information about the application
- **File-based Layout**: Uses `(tabs)/` directory structure for tab organization

### Lab 5 Integration - Context and Details
- **ItemContext**: Centralized state management for items using React Context
- **Details Page**: Individual item view with comprehensive information
- **Delete Functionality**: Remove items with user confirmation
- **Navigation**: Seamless navigation between list and details

### Lab 6 Integration - Remote Data Fetching
- **Remote Data**: Fetches product data from remote JSON source
- **Loading States**: Shows loading indicator while fetching data
- **Error Handling**: Graceful fallback to local data if remote fetch fails
- **CORS Proxy**: Uses allorigins proxy to handle cross-origin requests

## Project Structure

```
homework2/items-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation layout
│   │   ├── index.tsx        # Items list (main tab)
│   │   └── about.tsx        # About page
│   ├── _layout.tsx          # Root layout with ItemProvider
│   └── details.tsx          # Item details page
├── context/
│   └── ItemContext.tsx      # Context for state management
├── types/
│   └── Item.tsx             # Type definitions
├── data/
│   └── items.json           # Local fallback data
├── styles/
│   └── common.ts            # Shared styles
└── assets/
    └── images/              # App icons and images
```

## Key Components

### ItemContext
- Manages items state and loading state
- Provides delete functionality
- Handles remote data fetching with fallback

### Navigation
- Tab-based navigation for main sections
- Stack navigation for item details
- Context-aware routing

### Data Flow
1. App loads → ItemContext fetches remote data
2. Items list displays with loading state
3. User taps item → navigates to details
4. Details page shows full item information
5. User can delete items with confirmation

## Usage

1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Navigate between Items and About tabs
4. Tap items to view details
5. Delete items from the details page

## Technical Integration

This app successfully combines:
- **Lab 4**: Tabbed UI with file-based routing
- **Lab 5**: Context management and detailed views
- **Lab 6**: Remote data fetching with error handling

The result is a cohesive application that demonstrates best practices from all three labs while maintaining clean, maintainable code structure.
