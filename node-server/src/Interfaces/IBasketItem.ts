/**
 * An interface that represents a BasketItem.
 */
export interface IBasketItem {
    basketId: string;
    itemId: string;
    quantity: number;
    dateAdded: Date;
    userId?: string;
}