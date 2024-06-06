import { IBasketItem } from "../Interfaces/IBasketItem";
import { IBasket } from "../Interfaces/IBasket";
import { IUser } from "../Interfaces/IUser";
import { Database } from "./Database";
import { IOrder } from "../Interfaces/IOrder";
import { IItem } from "../Interfaces/IItem";
import { IItemImage } from "../Interfaces/IItemImage";

/**
 * Writes data to the database.
 */
export class DataWriter {
    private databaseConnection: Promise<Database>;

    /**
     * Constructs a new WriteData object.
     * @param databaseConnection The connection to the database.
     */
    public constructor(databaseConnection: Promise<Database>) {
        this.databaseConnection = databaseConnection;
    }
    
    /**
     * Adds a User to the Database.
     * @param user The User.
     */
    public async addUser(user: IUser): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "INSERT INTO Users" +
                    "(id, email, password, address, encodedInterestedCategories)" +
                    "VALUES (?, ?, ?, ?, ?)";

        await database.querySql(sql, [user.id, user.email, user.password, user.address, user.encodedInterestedCategories]);
    }

    /**
     * Updates a User in the Database.
     * @param user The User.
     */
    public async updateUser(user: IUser): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "UPDATE Users SET email=?, password=?, address=?, encodedInterestedCategories=? WHERE id=?";

        await database.querySql(sql, [user.email, user.password, user.address, user.encodedInterestedCategories, user.id]);
    }

    /**
     * Deletes a User from the Database.
     * @param id The User's ID.
     */
    public async deleteUser(id: string): Promise<void> {
        const database = await this.databaseConnection;

        await database.beginTransaction();

        try {

            // As these tables have foreign keys, delete the referencing rows first.
            // Delete referencing rows in ItemImages.
            // Then delete any related data from the Items table.
            // Delete referencing rows in Baskets.
            // Delete referencing rows in Orders.

            await database.querySql("DELETE FROM ItemImages WHERE id IN (SELECT id FROM Items WHERE sellerId=?)", [id]);
            
            await database.querySql("DELETE FROM Items WHERE buyerId=?", [id]);

            await database.querySql("DELETE FROM Baskets WHERE userId=?", [id]);

            await database.querySql("DELETE FROM Orders WHERE buyerId=?", [id]);
    
            const sql = "DELETE FROM Users WHERE id=?";
            await database.querySql(sql, [id]);
    
            await database.commitTransaction();
        } catch (error) {
            await database.rollbackTransaction();
            console.error("Failed to delete user:", error);
            throw error;
        }
    }

    /**
     * Adds a Basket to the Database.
     * @param basket The Basket.
     */
    public async addBasket(basket: IBasket) {
        const database = await this.databaseConnection;
        const sql = "INSERT INTO Baskets" +
                    "(id, userId)" +
                    "VALUES (?, ?)";

        await database.querySql(sql, [basket.id, basket.userId]);
    }

    /**
     * Updates a Basket in the Database.
     * @param basket The Basket.
     */
    public async updateBasket(basket: IBasket): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "UPDATE Baskets SET userId=? WHERE id=?";

        await database.querySql(sql, [basket.userId, basket.id]);
    }

    /**
     * Deletes a Basket from the Database.
     * @param id The Id Basket.
     */
    public async deleteBasket(id: string): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "DELETE FROM Baskets WHERE id=?";

        await database.querySql(sql, [id]);

        // If the Basket is deleted, remove the Items in the Basket.
        await database.querySql("DELETE FROM BasketItems WHERE basketId=?", [id]);
    }

    /**
     * Adds a BasketItem to the Database.
     * @param basketItem The BasketItem.
     */
    public async addBasketItem(basketItem: IBasketItem): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "INSERT INTO BasketItems" +
                    "(basketId, itemId, quantity, dateAdded)" +
                    "VALUES (?, ?, ?, ?)";

        await database.querySql(sql, [basketItem.basketId, basketItem.itemId, basketItem.quantity, basketItem.dateAdded]);
    }

    /**
     * Updates a BasketItem in the Database.
     * @param basketItem The BasketItem.
     */
    public async updateBasketItem(basketItem: IBasketItem): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "UPDATE BasketItems SET itemId=?, quantity=?, dateAdded=? WHERE basketId=?";

        await database.querySql(sql, [basketItem.itemId, basketItem.quantity, basketItem.dateAdded, basketItem.basketId]);
    }

    /**
     * Deletes a BasketItem from the Database.
     * @param basketItemId The Id of the Item in the Basket.
     */
    public async deleteBasketItem(basketId: string, basketItemId: string): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "DELETE FROM BasketItems WHERE basketId=? AND itemId=?";

        await database.querySql(sql, [basketId, basketItemId]);
    }

    /**
     * Adds an Order to the Database.
     * @param order The Order.
     */
    public async addOrder(order: IOrder): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "INSERT INTO Orders" +
                    "(id, buyerId, status, totalAmount, purchaseDate)" +
                    "VALUES (?, ?, ?, ?, ?)";

        await database.querySql(sql, [order.id, order.buyerId, order.status, order.totalAmount, order.purchaseDate]);
    }

    /**
     * Updates an Order in the Database.
     * @param order The Order.
     */
    public async updateOrder(order: IOrder): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "UPDATE Orders SET buyerId=?, status=?, totalAmount=?, purchaseDate=? WHERE id=?";

        await database.querySql(sql, [order.buyerId, order.status, order.totalAmount, order.purchaseDate, order.id]);
    }

    /**
     * Deletes an Order from the Database.
     * @param order The Order.
     */
    public async deleteOrder(order: IOrder): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "DELETE FROM Orders WHERE id=?";

        await database.querySql(sql, [order.id]);
    }

    /**
     * Adds an Item to the Database.
     * @param item The Item.
     */
    public async addItem(item: IItem) {
        const database = await this.databaseConnection;
        const sql = "INSERT INTO Items" +
                    "(id, name, price, description, quantityAvailable, isPurchased, sellerId, buyerId, orderId, basketId, encodedCategories, dateAdded, averageRating, numOfRatings, image)" +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        await database.querySql(sql, [
            item.id,
            item.name,
            item.price,
            item.description,
            item.quantityAvailable,
            item.isPurchased ? 1 : 0,
            item.sellerId,
            item.buyerId || null,
            item.orderId || null,
            item.basketId || null,
            item.encodedCategories,
            item.dateAdded,
            item.averageRating ?? 0,
            item.numOfRatings ?? 0,
            item.image || null
        ]);
    }

    /**
     * Updates an Item in the Database.
     * @param item The Item.
     */
    public async updateItem(item: IItem): Promise<void> {
        const database = await this.databaseConnection;

        const sql = "UPDATE Items SET name=?, price=?, description=?, quantityAvailable=?, isPurchased=?, sellerId=?, buyerId=?, orderId=?, basketId=?, encodedCategories=?, dateAdded=?, averageRating=?, numOfRatings=?, image=? WHERE id=?";

        if (isNaN(item.averageRating)) {
            item.averageRating = 0;
        }
        
        await database.querySql(sql, [
            item.name,
            item.price,
            item.description,
            item.quantityAvailable,
            item.isPurchased,
            item.sellerId,
            item.buyerId,
            item.orderId,
            item.basketId,
            item.encodedCategories,
            item.dateAdded,
            item.averageRating,
            item.numOfRatings,
            item.image,
            item.id
        ]);
    }

    /**
     * Deletes an Item from the Database.
     * @param item The Item.
     */
    public async deleteItem(id: string): Promise<void> {
        const database = await this.databaseConnection;
        const sql = "DELETE FROM Items WHERE id=?";

        await database.querySql(sql, [id]);
    }
}