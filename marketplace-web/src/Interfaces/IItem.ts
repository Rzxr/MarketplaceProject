import { IImage } from "./IImage";

/**
 * Interface for the Item object
 */
export interface IItem {
    id: string;
    name: string;
    price: string;
    description: string;
    quantityAvailable: number;
    isPurchased: boolean;
    sellerId: string;
    buyerId: string | null;
    orderId: string | null;
    basketId: string | null;
    encodedCategories: string;
    dateAdded: Date;
    averageRating: number;
    numOfRatings: number;
    image: string | null;
}