/**
 * Items Index - Main list view displaying all available items
 *
 * This is the primary screen of the application that displays a list
 * of available items fetched from a remote source. Users can browse through 
 * items and tap on any item to navigate to its detailed view.
 * 
 * Integrates:
 * - Lab 5: Context-based item management and navigation
 * - Lab 6: Fetch functionality for remote data loading
 */

import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Item } from "../../types/Item";
import { commonStyles } from "../../styles/common";
import { useItemContext } from "../../context/ItemContext";

export default function ItemsIndex() {
    const { items, isLoading } = useItemContext();
    const router = useRouter();

    // Renders an individual item
    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push({
                pathname: "/details",
                params: { id: item.id },
            })}
        >
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );

    // Show loading indicator while fetching data
    if (isLoading) {
        return (
            <View style={[commonStyles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading items...</Text>
            </View>
        );
    }

    // Returns the list of individual items
    return (
        <View style={[commonStyles.container, commonStyles.listPadding]}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
    },
    arrow: {
        fontSize: 24,
        color: "#ccc",
        marginLeft: 16,
    },
    list: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});
