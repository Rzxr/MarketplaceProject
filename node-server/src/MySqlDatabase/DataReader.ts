import { IBasketItem } from "../Interfaces/IBasketItem";
import { IBasket } from "../Interfaces/IBasket";
import { IItem } from "../Interfaces/IItem";
import { IItemImage } from "../Interfaces/IItemImage";
import { IOrder } from "../Interfaces/IOrder";
import { IUser } from "../Interfaces/IUser";
import { Database } from "./Database";

/**
 * Reads the data from the database.
 */
export class DataReader {
    private databaseConnection: Promise<Database>;

    /**
     * Constructs a new ReadData object.
     * @param databaseConnection The connection to the database.
     */
    public constructor(databaseConnection: Promise<Database>) {
        this.databaseConnection = databaseConnection;
    }

    /**
     * Gets the users from the Users database table.
     * @returns All users in the database.
     */
    public async getUsers(): Promise<IUser[]> {
        const database = await this.databaseConnection;
        const sql = "SELECT * FROM " + "Users";
        return (await database.querySql(sql, [])) as IUser[];
    }

    /**
     * Gets the items from the Items database table.
     * @returns All items in the database.
     */
    public async getItems(): Promise<IItem[]> {
        const database = await this.databaseConnection;
        const sql = "SELECT * FROM " + "Items";
        return (await database.querySql(sql, [])) as IItem[];
    }

    /**
     * Gets the baskets from the Baskets database table.
     * @returns All baskets in the database.
     */
    public async getBaskets(): Promise<IBasket[]> {
        const database = await this.databaseConnection;
        const sql = "SELECT * FROM " + "Baskets";
        return (await database.querySql(sql, [])) as IBasket[];
    }

    /**
     * Gets the Items in the Baskets from the BasketItems database table.
     * @returns All basket items in the database.
     */
    public async getBasketItems(): Promise<IBasketItem[]> {
        const database = await this.databaseConnection;
        const sql = "SELECT * FROM " + "BasketItems";
        return (await database.querySql(sql, [])) as IBasketItem[];
    }

    /**
     * Gets the orders from the Orders database table.
     * @returns All orders in the database.
     */
    public async getOrders(): Promise<IOrder[]> {
        const database = await this.databaseConnection;
        const sql = "SELECT * FROM " + "Orders";
        return (await database.querySql(sql, [])) as IOrder[];
    }
}