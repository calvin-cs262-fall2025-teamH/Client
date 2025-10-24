/**
 * ItemContext - React Context for managing application items with fetch functionality
 *
 * This context provides centralized state management for the item list,
 * including the ability to delete items and fetch data from a remote source.
 * Items are loaded from a remote JSON file using fetch() and managed in component state.
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * <ItemProvider>
 *   ... app components ...
 * </ItemProvider>
 *
 * // Use in components
 * const { items, deleteItem, isLoading } = useItemContext();
 * ```
 */

import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Item } from "../types/Item";

/**
 * This context type defines the shape of the context value that includes
 * the items array, loading state, and a function to delete items by their unique identifier.
 *
 * @interface ItemContextType
 * @property items - Array of all available items
 * @property deleteItem - Function to remove an item by its ID
 * @property isLoading - Boolean indicating if data is being fetched
 */
interface ItemContextType {
    items: Item[];
    deleteItem: (id: string) => void;
    isLoading: boolean;
}

/**
 * This creates and exports the context for item state management.
 * It returns undefined if used outside of ItemProvider, which allows
 * components to detect if they're properly wrapped.
 */
export const ItemContext = createContext<ItemContextType | undefined>(undefined);

/**
 * This creates and exports the provider component.
 *
 * It fetches items from a remote JSON file and provides methods to manipulate them,
 * using React state to manage them.
 *
 * @param children - React components that need access to item context
 */
export const ItemProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // Initialize items as empty array
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetches product items from a remote JSON file
     * Uses a CORS proxy to avoid cross-origin issues
     */
    const getProductItems = async () => {
        try {
            setIsLoading(true);
            // Using the same URL from lab 6 with CORS proxy
            const response = await fetch('https://api.allorigins.win/raw?url=https://cs.calvin.edu/courses/cs/262/kvlinden/05design/data/items.json');
            const json = await response.json();
            setItems(json);
        } catch (error) {
            console.error('Error fetching items:', error);
            // Fallback to local data if remote fetch fails
            const localItems = [
                {
                    "id": "1",
                    "title": "Wireless Headphones",
                    "description": "High-quality wireless headphones with noise cancellation. Perfect for music lovers and professionals who need to focus in noisy environments.",
                    "category": "Electronics",
                    "price": 199.99
                },
                {
                    "id": "2",
                    "title": "Coffee Maker",
                    "description": "Programmable coffee maker with auto-brew feature. Wake up to freshly brewed coffee every morning with this reliable and easy-to-use machine.",
                    "category": "Kitchen",
                    "price": 89.99
                },
                {
                    "id": "3",
                    "title": "Running Shoes",
                    "description": "Comfortable running shoes with excellent cushioning and support. Designed for both casual joggers and serious runners.",
                    "category": "Sports",
                    "price": 129.99
                }
            ];
            setItems(localItems);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch items on component mount
    useEffect(() => {
        getProductItems();
    }, []);

    /**
     * Removes an item from the list by filtering out the matching ID
     *
     * Uses React.useCallback to memoize the function, which prevents
     * unnecessary re-renders of child components that receive this
     * function as a prop.
     *
     * @param id - The unique identifier of the item to delete
     */
    const deleteItem = React.useCallback((id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }, []); // Empty dependency array - function doesn't depend on any props or state

    // Context value object containing all state and actions
    const value: ItemContextType = {
        items,
        deleteItem,
        isLoading,
    };

    return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

/**
 * Custom hook to safely access ItemContext
 *
 * It handles the null check and provides a helpful error message if used
 * outside of ItemProvider. This eliminates boilerplate in components.
 *
 * @returns The context value containing items, deleteItem function, and loading state
 * @throws Error if used outside of ItemProvider
 */
export const useItemContext = () => {
    const context = useContext(ItemContext);
    if (!context) {
        throw new Error("useItemContext must be used within an ItemProvider");
    }
    return context;
};
