import { IBasket } from "../Interfaces/IBasket";
import { id } from "../Utils/ID";
import { IBasketItem } from "../Interfaces/IBasketItem";

/**
 * A class that represents a Basket.
 */
export class Basket implements IBasket {
    private _id: string;
    private _userId: string;
    private _itemsInBasket: Map<string, IBasketItem> = new Map();

    /**
     * Constructs a Basket.
     * @param userId The User ID.
     * @param basketId The Basket ID.
     */
    public constructor(userId: string, basketId: string | undefined) {
        this._userId = userId;
        this._id = typeof basketId == "undefined" ? new id().toString() : basketId;
    }

    /**
     * Adds an Item to the Basket.
     * @param date The date added.
     * @param Item The item.
     * @param quantity The amount of the Item.
     */
    public addItem(itemId: string, quantity: number, date: Date) {
        this._itemsInBasket.set(itemId, { basketId: this._id, itemId: itemId, quantity: quantity, dateAdded: date} as IBasketItem);
    }

    /**
     * Removes an Item from the Basket.
     * @param date The date of the Item.
     */
    public deleteItem(itemId: string) {
        this._itemsInBasket.delete(itemId);
    }

    /**
     * Gets the ID of the Basket.
     * @returns The ID of the Basket.
     */
    public get id() {
        return this._id;
    }

    /**
     * Sets the ID of the Basket.
     * @param basketId The ID of the Basket.
     */
    public set id(basketId: string) {
        this._id = basketId;
    }

    /**
     * Gets the User ID of the Basket.
     * @returns The User ID of the Basket.
     */
    public get userId() {
        return this._userId;
    }

    /**
     * Updates the Basket's data.
     * @param basketData The basket data to update.
     */
    public update(basketData: Partial<IBasket>) {
        if (basketData.userId) {
            this._userId = basketData.userId;
        }

        if (basketData.id) {
            this._id = basketData.id;
        }
    }

    /**
     * Updates an Item in the Basket.
     * @param basketItem The BasketItem.
     * @returns The updated BasketItem or undefined.
     */
    public updateItemBasket(basketItem: IBasketItem): IBasketItem | undefined{
        const item = this._itemsInBasket.get(basketItem.itemId);

        if (!item) {
            return;
        }

        item.quantity = basketItem.quantity;
        item.dateAdded = basketItem.dateAdded;

        this._itemsInBasket.set(basketItem.itemId, item);

        return item;
    }

    /**
     * Gets the Items in the Basket.
     * @returns The Items in the Basket.
     */
    public getItemsInBasket(): Map<string, IBasketItem>{
        return this._itemsInBasket;
    }

    /**
     * Converts the Items in the Basket to a JSON object.
     * @returns An array of the Items in the Basket to be used with JSON.stringify.
     */
    public getItemsInBasketToJSON(): { basketId: string; itemId: string; quantity: number; dateAdded: Date }[] {
        return Array.from(this._itemsInBasket.entries()).map(([itemId, basketItem]) => ({
            basketId: basketItem.basketId,
            itemId: itemId,
            quantity: basketItem.quantity,
            dateAdded: basketItem.dateAdded
        }));
    }

    /**
     * Converts the Basket to a JSON object.
     * @returns A Record of the Basket to be used with JSON.stringify.
     */
    public toJSON(): Record<string, unknown> {
        return {
            id: this._id,
            userId: this._userId,
            itemsInBasket: Array.from(this._itemsInBasket.entries()).map(([itemId, basketItem]) => ({
                basketId: basketItem.basketId,
                itemId: itemId,
                quantity: basketItem.quantity,
                dateAdded: basketItem.dateAdded
            }))
        };
    }
}