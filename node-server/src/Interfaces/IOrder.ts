import { Item } from "../CommerceEntity/Item";
import { OrderStatus } from "../CommerceEntity/Order";
import { ICommerceEntity } from "./ICommerceEntity";

/**
 * An interface that represents an Order.
 */
export interface IOrder extends ICommerceEntity {
    id: string;
    buyerId: string;
    status: OrderStatus;
    totalAmount: number;
    purchaseDate: Date;
    items: Item[] | undefined;
}