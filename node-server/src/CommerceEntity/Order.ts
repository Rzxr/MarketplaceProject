import { IOrder } from "../Interfaces/IOrder";
import { Item } from "./Item";
import { id } from "../Utils/ID";

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
 * A class that represents an Order.
 */
export class Order implements IOrder {
    private _id: string;
    private _items: Map<string, Item>;
    private _buyerId: string;
    private _status: OrderStatus;
    private _totalAmount: number;
    private _purchaseDate: Date;

    /**
     * Constructs an Order.
     * @param buyerId The id of the Buyer.
     * @param status The status of the Order.
     * @param purchaseDate The date of the purchase.
     * @param totalAmount The total amount of the Order.
     * @param oid The id of the Order.
     * @param items The Items in the Order.
     */
    public constructor(buyerId: string, status: OrderStatus, purchaseDate: Date, totalAmount: number | undefined, oid: string | undefined, items: Item[] | undefined) {
        this._buyerId = buyerId;
        this._status = status;
        this._purchaseDate = purchaseDate;

        this._items = new Map<string, Item>();
        if (items) {
            for (const item of items) {
                this._items.set(item.id, item);
            }
        }

        this._totalAmount = typeof totalAmount === "undefined" ? this.calculateTotalAmount() : totalAmount;
        this._id = typeof oid === "undefined" ? new id().toString() : oid;
    }

    /**
     * Gets the id.
     * @returns The id.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Gets the Items in the Order.
     * @returns The Items in the Order.
     */

    public get items(): Item[] {
        return Array.from(this._items.values());
    }

    /**
     * Gets the Buyer ID.
     * @returns The Buyer ID.
     */
    public get buyerId(): string {
        return this._buyerId;
    }

    /**
     * Gets the status.
     * @returns The status.
     */
    public get status(): OrderStatus {
        return this._status;
    }

    /**
     * Sets the status.
     * @param status The status.
     */
    public set status(status: OrderStatus) {
        this._status = status;
    }

    /**
     * Gets the total amount.
     * @returns The total amount.
     */
    public get totalAmount(): number {
        return this._totalAmount;
    }

    /**
     * Gets the purchase date.
     * @returns The purchase date.
     */
    public get purchaseDate(): Date {
        return this._purchaseDate;
    }

    /**
     * Sets the purchase date.
     * @param purchaseDate The purchase date.
     */
    public set purchaseDate(purchaseDate: Date) {
        this._purchaseDate = purchaseDate;
    }

    /**
     * Adds an Item to the Order.
     * @param item The Item to add.
     */
    public addItem(item: Item) {
        this._items.set(item.id, item);
    }

    /**
     * Gets the total amount of the Order.
     * @returns The total amount of the Order.
     */
    public calculateTotalAmount(): number {
        let totalAmount = 0;

        // TODO: Add functionality for additional item quantites
        const quantity = 1;

        this.items.forEach(item => {
            totalAmount += item.price * quantity;
        });

        return parseFloat(totalAmount.toFixed(2));
    }

    /**
     * Converts the Order to a JSON object.
     * @returns A Record of the Order to be used with JSON.stringify.
     */
    public toJSON() {
        return {
            id: this._id,
            items: Array.from(this._items.values()).map(item => item.toJSON()),
            buyerId: this._buyerId,
            status: this._status.toString(),
            totalAmount: this._totalAmount,
            purchaseDate: this._purchaseDate
        };
    }
}