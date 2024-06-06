import { Basket } from "./Basket";
import { id } from "../Utils/ID";
import { IUser } from "../Interfaces/IUser";
import { Order } from "./Order";
import { CategoriesEnum } from "./Recommendations/CategoriesEnum";
import { BackendUtils } from "../Utils/BackendUtils";
import { IItem } from "../Interfaces/IItem";
import * as bcrypt from "bcrypt";

/**
 * A class that represents a Marketplace User.
 */
export class User implements IUser {
    private _id: string;
    private _email: string;
    private _password: string;
    private _address: string;

    // Note: Orders are accessed using their order ids.
    private _orders: Map<string, Order> = new Map<string, Order>();
    private _basket: Basket;

    private _interestedCategories = new Set<CategoriesEnum>();

    private _saltRounds = 10;

    /**
     * Constucts a User.
     * @param email The User's email.
     * @param password The User's password.
     * @param address The User's address.
     * @param encodedInterestedCategories The User's interested categories.
     * @param uid The User's id.
     */
    public constructor(email: string, password: string, address: string, encodedInterestedCategories: string, uid: string | undefined) {
        this._id = typeof uid === "undefined" ? new id().toString() : uid;
        this._email = email;
        this._password = password.length < 60 ? this.hashPlainTextPassword(password) : password;

        this._address = address;
        this._basket = new Basket(this._id, undefined);
        this._interestedCategories = BackendUtils.convertEncodedCategoriesToSet(encodedInterestedCategories);
    }

    /**
     * Gets the User's id.
     * @returns The User's id.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Gets the User's email.
     * @returns The User's email.
     */
    public get email(): string {
        return this._email;
    }

    /**
     * Sets the User's email.
     * @param email The User's email.
     */
    public set email(email: string) {
        this._email = email;
    }
    
    /**
     * Gets the User's password.
     * @returns The User's password.
     */
    public get password(): string {
        return this._password;
    }

    /**
     * Sets the User's password.
     * @param password The User's password.
     */
    public set password(password: string) {

        // Note: bcrypt will store the salt with the password
        const passwordSalt = bcrypt.genSaltSync(this._saltRounds);
        this._password = bcrypt.hashSync(password, passwordSalt);
    }

    /**
     * Verifies the User's password.
     * @param inputPassword The password to verify.
     * @returns True if the password is correct, false otherwise.
     */
    public verifyPassword(inputPassword: string): boolean {
        return bcrypt.compareSync(inputPassword, this._password);
    }

    /**
     * Hashes a plain text password.
     * @param password The password to hash.
     * @returns The hashed password.
     */
    public hashPlainTextPassword(password: string): string {
        if (password.length < 60) {

            const passwordSalt = bcrypt.genSaltSync(this._saltRounds);
            return bcrypt.hashSync(password, passwordSalt);
        }

        return password;
    }

    /**
     * Gets the User's address.
     * @returns The User's address.
     */
    public get address(): string {
        return this._address;
    }

    /**
     * Sets the User's address.
     * @param address The User's address.
     */
    public set address(address: string) {
        this._address = address;
    }

    /**
     * Gets the User's Orders.
     * @returns The User's Orders.
     */
    public get orders(): Map<string, Order> {
        return this._orders;
    }

    /**
     * Sets the User's Orders.
     * @param orders The User's Orders.
     */
    public set orders(orders: Map<string, Order>) {
        this._orders = orders;
    }

    /**
     * Gets the User's basket.
     * @returns The User's basket.
     */
    public get basket(): Basket {
        return this._basket;
    }

    /**
     * Sets the User's basket. 
     * @param basket The User's basket.
     */
    public setBasket(basket: Basket) {
        this._basket = basket;
    }

    /**
     * Adds an item to the User's previous purchases.
     * @param item The item to be added.
     * @returns The added order.
     */
    public addToOrders = (order: Order): Order => {
        this.orders.set(order.id, order);
        return order;
    };

    /**
     * Gets the User's interested categories.
     * @returns The User's interested categories.
     */
    public get interestedCategories(): Set<CategoriesEnum> {
        return this._interestedCategories;
    }

    /**
     * Gets the User's interested categories as strings.
     * @returns The User's interested categories.
     */
    public get interestedCategoryStrings(): Set<string> {
        const interestedCategoryStrings = new Set<string>;

        for (const category in this._interestedCategories) {
            interestedCategoryStrings.add(category);
        }

        return interestedCategoryStrings;
    }

    /**
     * Adds to the User's interested categories.
     * @param category The category to be added.
     */
    public addToInterestedCategories = (category: CategoriesEnum) => {
        this._interestedCategories.add(category);
    };

    /**
     * Gets the User's interested categories as a string.
     */
    public get encodedInterestedCategories(): string {
        return BackendUtils.convertSetToEncodedCategories(this._interestedCategories);
    }

    /**
     * Updates the User's data.
     * @param userData The user data to update.
     */
    public update(userData: Partial<IUser>) {
        if (userData.email) {
            this.email = userData.email;
        }

        if (userData.password) {
            this.password = userData.password;
        }

        if (userData.address) {
            this.address = userData.address;
        }

        if (userData.encodedInterestedCategories) {
            this._interestedCategories = BackendUtils.convertEncodedCategoriesToSet(userData.encodedInterestedCategories);
        }
    }

    /**
     * Gets the User's most recent order.
     * @returns The User's most recent order.
     */
    public getMostRecentOrder(): Order | null {
        let mostRecentOrder: Order | null = null;
        let mostRecentOrderDate: Date | null = null;

        // Loop through each order and get the most recent one
        this.orders.forEach(order => {
            if (mostRecentOrderDate === null || order.purchaseDate > mostRecentOrderDate) {
                mostRecentOrder = order;
                mostRecentOrderDate = order.purchaseDate;
            }
        });

        return mostRecentOrder;
    }

    /**
     * Clears the User's basket.
     */
    public clearBasket() {
        this._basket = new Basket(this._id, undefined);
    }

    /**
     * Gets all items from the User's orders.
     * @returns An array of all items from the User's orders.
     */
    public getAllItemsFromOrders(): IItem[] {
        const items: IItem[] = [];

        this._orders.forEach(order => {
            order.items.forEach(item => {
                items.push(item);
            });
        });

        return items;
    }

    /**
     * Converts all orders to a JSON object.
     * @returns An array of all orders in JSON format.
     */
    public getAllOrdersToJSON() {
        return Array.from(this._orders.entries()).map(([orderId, order]) => ({ orderId, ...order.toJSON() }));
    }

    /**
     * Converts the User to a JSON object.
     * @returns A Record of the User to be used with JSON.stringify.
     */
    public toJSON() {
        return {
            id: this._id,
            email: this._email,
            password: this._password,
            address: this._address,
            orders: Array.from(this._orders.entries()).map(([orderId, order]) => ({ orderId, ...order.toJSON() })),
            basket: this._basket.toJSON(),
            encodedInterestedCategories: BackendUtils.convertSetToEncodedCategories(this._interestedCategories)
        };
    }
}