import { IOrder } from "../Interfaces/IOrder";
import { id } from "../Utils/ID";
import { Item } from "./Item";
import { Order, OrderStatus } from "./Order";

/**
 * A class that manages Orders.
 */
export class OrderManager {
    private _orders: Map<string, Order>;
   
    /**
     * Constructs an OrderManager.
     */
    public constructor() {
        this._orders = new Map<string, Order>();
    }

    /**
     * Gets the Orders.
     * @returns The Orders.
     */
    public getOrders(): Map<string, Order> {
        return this._orders;
    }

    /**
     * Adds an Order.
     * @param order The Order.
     */
    public addOrder(order: Order) {
        this._orders.set(order.id, order);
    }

    /**
     * Creates a new Order.
     * @param userId The User ID.
     * @param items The Items.
     * @returns The Order.
     */
    public createOrder(userId: string, items: Item[]): Order {
        const order = new Order(userId, OrderStatus.PURCHASED, new Date(), undefined , items[0].orderId!, items);
        this.addOrder(order);

        return order;
    }

    /**
     * Deletes an Order.
     * @param orderId The id.
     */
    public deleteOrder(orderId: string) {
        this._orders.delete(orderId);
    }

    /**
     * Gets an Order.
     * @param orderId The id.
     * @returns The Order or undefined.
     */
    public getOrder(orderId: string): Order | undefined {
        return this._orders.get(orderId);
    }

    /**
     * Registers Orders.
     * @param orders The Orders.
     */
    public registerOrders(orders: IOrder[], items: Map<string, Item>) {
        for (const order of orders) {
            this.addOrder(this.reconstructOrder(order));
        }

        // Add the items that were part of the order.
        for (const item of items.values()) {
            if (typeof item.orderId !== "undefined") {
                const order = this.getOrder(item.orderId!);

                if (typeof order !== "undefined") {
                    order.addItem(item);
                }
            }
        }
    }

    /**
     * Reconstructs an Order.
     * Note: this is a workaround as TypeScript casts the database data to an Order which does not actually call Order's constructor.
     * @param order The Order.
     * @returns The reconstructed Order.
     */
    private reconstructOrder(order: IOrder): Order {
        return new Order(
            order.buyerId,
            order.status,
            order.purchaseDate,
            order.totalAmount,
            order.id,
            order.items
        );
    }
}