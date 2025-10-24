/**
 * RootLayout - Main app layout component using Expo Router
 *
 * This module defines the root navigation structure using Expo Router's
 * Stack navigator and integrates the ItemProvider context.
 *
 * Navigation Structure:
 * - (tabs): Tab-based navigation with items and about pages
 */

import React from "react";
import { Stack } from "expo-router";
import { ItemProvider } from "../context/ItemContext";

export default function RootLayout() {
    return (
        <ItemProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                    name="details" 
                    options={{ 
                        title: "Details",
                        headerStyle: {
                            backgroundColor: '#007AFF',
                        },
                        headerTintColor: '#fff',
                    }} 
                />
            </Stack>
        </ItemProvider>
    );
}
