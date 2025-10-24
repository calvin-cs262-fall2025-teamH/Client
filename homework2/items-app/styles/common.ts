/**
 * Common Styles - Shared styling definitions for the application
 *
 * This module contains reusable style definitions that are used across
 * multiple components. It helps maintain consistency and reduces code
 * duplication in the styling layer.
 */

import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listPadding: {
        padding: 16,
    },

    whiteCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    headerStyle: {
        backgroundColor: '#007AFF',
    },
});

// Header (non-style) configuration constants
export const headerConfig = {
    tintColor: 'white',
};
