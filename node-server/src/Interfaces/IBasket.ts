import { ICommerceEntity } from "./ICommerceEntity";

/**
 * An interface that represents a Basket.
 */
export interface IBasket extends ICommerceEntity {
    id: string;
    userId: string;
}