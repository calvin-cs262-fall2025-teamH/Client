/**
 * Item Type Definition
 *
 * This module defines the primary item data type, along with a default value
 * for error handling.
 */

export interface Item {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
}

export const defaultItem: Item = {
    id: '',
    title: 'Item not found',
    description: 'This item could not be found.',
    category: 'Unknown',
    price: 0
};
