import { IItem } from "./IItem";

/**
 * Represents an Frontend Item in a Basket.
 */
export interface IItemInBasket extends IItem {
    quantity: number;
    dateAdded: Date;
}