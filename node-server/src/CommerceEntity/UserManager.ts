import { User } from "./User";
import { id } from "../Utils/ID";
import { IUser } from "../Interfaces/IUser";
import { Order } from "./Order";
import { Basket } from "./Basket";
import { IBasketItem } from "../Interfaces/IBasketItem";

/**
 * A class that manages Users.
 */
export class UserManager {
    private _users: Map<string, User>;

    /**
     * Constructs a UserManager.
     */
    public constructor() {
        this._users = new Map();
    }

    /**
     * Adds a User.
     * @param user The User.
     */
    public addUser(user: IUser): void {
        this._users.set(user.id, user as User);
    }

    /**
     * Deletes a User.
     * @param userId The id.
     * @returns True if the User was deleted, otherwise False.
     */
    public deleteUser(userId: string): boolean {
        if (typeof userId === "string") {
            return this._users.delete(userId);
        }

        return this._users.delete(userId);
    }

    /**
     * Gets the Users
     * @returns The Users.
     */
    public getUsers(): Map<string, User>  {
        return this._users;
    }

    /**
     * Gets a User.
     * @param userId The id.
     * @returns The User or undefined.
     */
    public getUser(userId: string): User | undefined {
        if (typeof userId === "string") {
            userId = new id(userId).toString();
        }

        for (const user of this._users.values()) {
            if (user.id === userId) {
                return user;
            }
        }
    }

    /**
     * Registers Users.
     * @param users The Users.
     * @param orders The Orders.
     * @param baskets The Baskets.
     * @param userInterestedCategories The UserInterestedCategories.
     */
    public registerUsers(users: IUser[], orders: Map<string, Order>, baskets: Map<string, Basket>) {

        // Loop through each user and add them to the manager
        users.forEach((user) => {
            this.addUser(this.reconstructUser(user));
        });

        // Loop through each order and add it to the User
        for (const order of orders.values()) {
            this.addOrderToUser(order.buyerId, order);
        }

        // Loop through each basket and add it to the User
        for (const user of this._users.values()) {
            for (const basket of baskets.values()) {
                if (user.id === basket.userId) {
                    this.addBasketToUser(user.id, basket);
                }
            }
        }
    }

    /**
     * Registers a User.
     * @param user A User.
     * @returns The registered User.
     */
    public registerUser(user: IUser): User {
        const newUser = this.reconstructUser(user);
        this.addUser(newUser);
        return newUser;
    }

    /**
     * Adds an Order to a User.
     * @param userId The User's id.
     * @param order The Order.
     * @returns The Order or undefined.
     */
    public addOrderToUser(userId: string, order: Order): Order | undefined{
        return this.getUser(userId)?.addToOrders(order);
    }

    /**
     * Sets a User's Basket.
     * @param userId The User's id.
     * @param basket The Basket.
     */
    public addBasketToUser(userId: string, basket: Basket) {
        this.getUser(userId)?.setBasket(basket);
    }

    /**
     * Authenticates a User.
     * @param email The email.
     * @param password The password.
     * @returns The User or undefined.
     */
    public authenticateUser(email: string, password: string): User | undefined {
        for (const user of this._users.values()) {
            if (user.email === email && user.verifyPassword(password)) {
                return user;
            }
        }
    }

    /**
     * Updates a User.
     * @param user The User.
     * @returns The updated User.
     */
    public updateUser(user: Partial<IUser>): IUser | undefined {
        const userId = user.id;

        if (!userId) {
            return;
        }

        const existingUser = this.getUser(userId);
        
        if (!existingUser) {
            return;
        }

        existingUser.update(user);

        return existingUser as IUser;
    }

    /**
     * Gets a User's Basket.
     * @param userId The User's id.
     * @returns The User's Basket.
     */
    public getUserBasket(userId: string): Basket | undefined {
        return this.getUser(userId)?.basket;
    }

    /**
     * Adds a BasketItem to a User.
     * @param basketItem The BasketItem.
     * @returns The BasketItem.
     */
    public addBasketItemToUser(basketItem: IBasketItem): IBasketItem {
        // Note: this will cause issues if it fails
        this.getUser(basketItem.userId!)?.basket.addItem(basketItem.itemId, basketItem.quantity, basketItem.dateAdded);
        return basketItem;
    }

    /**
     * Updates a BasketItem.
     * @param basketItem The BasketItem.
     * @returns The updated BasketItem.
     */
    public updateBasketItem(basketItem: IBasketItem): IBasketItem | undefined {
        return this.getUser(basketItem.userId!)?.basket.updateItemBasket(basketItem);
    }

    /**
     * Deletes a BasketItem from a User.
     * @param basketItem The BasketItem.
     */
    public deleteBasketItemFromUser(basketItem: IBasketItem): IBasketItem{
        this.getUser(basketItem.userId!)?.basket.deleteItem(basketItem.itemId);
        return basketItem;
    }

    /**
     * Clears a User's Basket.
     * @param userId The User's id.
     */
    public clearUserBasket(userId: string): void {
        this.getUser(userId)?.clearBasket();
    }

    /**
     * Reconstructs a User.
     * Note: this is a workaround as TypeScript casts the database data to an User which does not actually call User's constructor.
     * @param user The User.
     * @returns The reconstructed User.
     */
    private reconstructUser(user: IUser): User {
        return new User(
            user.email,
            user.password,
            user.address,
            user.encodedInterestedCategories,
            user.id
        );
    }
}