import { IItem } from "./IItem";

/**
 * An enum that represents the status of an Order.
 */
export enum OrderStatus {
    "PROCESSING",
    "PURCHASED",
    "POSTED",
    "DELIVERED",
    "CANCELLED"
}

/**
 * An interface that represents an Order.
 */
export interface IOrder {
    id: string;
    buyerId: string;
    status: OrderStatus;
    totalAmount: number;
    purchaseDate: Date;
    items: IItem[] | undefined;
}