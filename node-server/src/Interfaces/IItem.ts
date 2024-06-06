import { ICommerceEntity } from "./ICommerceEntity";

/**
 * An interface that represents an Item.
 */
export interface IItem extends ICommerceEntity {
    id: string;
    name: string;
    price: number;
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
    newRating?: number;
    image: string | null;
}