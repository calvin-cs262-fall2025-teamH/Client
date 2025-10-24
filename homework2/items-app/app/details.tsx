/**
 * Details - Individual item details view
 *
 * This screen displays comprehensive information about a specific item that
 * was selected from the main list and provides delete functionality. It
 * receives the item data via navigation parameters.
 *
 * Integrates Lab 5's detailed view with context-based item management.
 *
 * Navigation Parameters:
 * - id - The unique identifier of the item to display
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Item, defaultItem } from "../types/Item";
import { commonStyles } from "../styles/common";
import { useItemContext } from "../context/ItemContext";

export default function Details() {
    // Extract the item ID from navigation parameters
    const { id } = useLocalSearchParams();
    const { items, deleteItem } = useItemContext();
    const router = useRouter();
    const selectedItem: Item = items.find(item => item.id === id) || defaultItem;

    // Handles item deletion with user confirmation
    const handleDelete = () => {
        if (Platform.OS === "web") {
            const confirmed = typeof window !== "undefined" && window.confirm(`Are you sure you want to delete "${selectedItem.title}"?`);
            if (confirmed) {
                deleteItem(selectedItem.id);
                router.back();
            }
            return;
        }

        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${selectedItem.title}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteItem(selectedItem.id);
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={commonStyles.container}>
            <View style={styles.contentPadding}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>{selectedItem.title}</Text>
                    <Text style={styles.category}>{selectedItem.category}</Text>
                </View>

                <View style={commonStyles.whiteCard}>
                    <Text style={styles.smallText}>Price</Text>
                    <Text style={styles.priceText}>
                        ${selectedItem.price.toFixed(2)}
                    </Text>
                </View>

                <View style={commonStyles.whiteCard}>
                    <Text style={styles.labelText}>Description</Text>
                    <Text style={styles.bodyText}>
                        {selectedItem.description}
                    </Text>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[commonStyles.button, commonStyles.dangerButton]}
                        onPress={handleDelete}
                    >
                        <Text style={commonStyles.buttonText}>Delete Item</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contentPadding: {
        padding: 20,
    },
    titleText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    labelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 16,
        color: "#555",
        lineHeight: 24,
    },
    smallText: {
        fontSize: 14,
        color: "#666",
    },
    priceText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#007AFF",
    },
    header: {
        marginBottom: 24,
    },
    category: {
        fontSize: 16,
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    actionButtonsContainer: {
        gap: 12,
        marginTop: 20,
        marginBottom: 30,
    },
});
