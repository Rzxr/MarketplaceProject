import { ItemManager } from "./CommerceEntity/ItemManager";
import { Database } from "./MySqlDatabase/Database";
import { UserManager } from "./CommerceEntity/UserManager";
import { DataReader } from "./MySqlDatabase/DataReader";
import { OrderManager } from "./CommerceEntity/OrderManager";
import { BasketManager } from "./CommerceEntity/BasketManager";
import { RecommendationManager } from "./CommerceEntity/Recommendations/RecommendationManager";
import { User } from "./CommerceEntity/User";
import { DataWriter } from "./MySqlDatabase/DataWriter";
import { OperationType } from "./Utils/OperationType";
import { IUser } from "./Interfaces/IUser";
import { IItem } from "./Interfaces/IItem";
import { IBasketItem } from "./Interfaces/IBasketItem";
import { id } from "./Utils/ID";

/**
 * A class that represents the Backend Service of the Marketplace.
 * This class is responsible for handling all the data operations.
 */
export class BackendService {
    private dataReader: DataReader;
    private dataWriter: DataWriter;
    
    private userManager: UserManager = new UserManager();
    private itemManager: ItemManager = new ItemManager();
    private orderManager: OrderManager = new OrderManager();
    private basketManager: BasketManager = new BasketManager();
    private recommendationManagers: Map<string, RecommendationManager> = new Map();

    /**
     * Constructs a BackendService.
     */
    public constructor() {
        this.dataReader = new DataReader(Database.getInstance());
        this.dataWriter = new DataWriter(Database.getInstance());
    }

    /**
     * Load the data from the database to the Backend
     */
    public async loadState() {
        this.itemManager.registerItems(await this.dataReader.getItems());

        this.orderManager.registerOrders(await this.dataReader.getOrders(), this.itemManager.getItems());

        this.basketManager.registerBaskets(await this.dataReader.getBaskets(), await this.dataReader.getBasketItems());
        
        this.userManager.registerUsers(await this.dataReader.getUsers(), this.orderManager.getOrders(), this.basketManager.getBaskets());

        for (const userElement of this.userManager.getUsers()) {
            this.recommendationManagers.set(userElement[0], new RecommendationManager(userElement[1], this.itemManager.getItemsFromAllOtherSellers(userElement[0])));
        }
    }

    /**
     * Gets or creates a RecommendationManager.
     * @param user The user.
     * @returns The RecommendationManager.
     */
    public async getRecommendationManager(user: User): Promise<RecommendationManager> {

        // Return the RecommendationManager and make sure it's up to date
        if (this.recommendationManagers.has(user.id)) {
            this.recommendationManagers.get(user.id)!.updateRecommendations(this.itemManager.getItemsFromAllOtherSellers(user.id));
            return this.recommendationManagers.get(user.id)!;
        }

        const manager = new RecommendationManager(this.userManager.getUser(user.id)!, this.itemManager.getNewestAndAvailableItems());
        this.recommendationManagers.set(user.id, manager);

        return manager;
    }

    /**
     * Gets a RecommendationManager by User ID.
     * @param userId The User ID.
     * @returns The RecommendationManager.
     */
    public async getRecommendationManagerById(userId: string): Promise<RecommendationManager> {
        return this.getRecommendationManager(this.userManager.getUser(userId)!);
    }

    /**
     * Gets the UserManager asynchronously.
     * @returns The UserManager.
     */
    public async getUserManager(): Promise<UserManager> {
        return this.userManager;
    }

    /**
     * Gets the ItemMananger asynchronously.
     * @returns The ItemManager.
     */
    public async getItemManager(): Promise<ItemManager> {
        return this.itemManager;
    }

    /**
     * Gets the OrderManager asynchronously.
     * @returns The OrderManager.
     */
    public async getOrderManager(): Promise<OrderManager> {
        return this.orderManager;
    }

    /**
     * Gets the BasketManager asynchronously.
     * @returns The BasketManager.
     */
    public async getBasketManager(): Promise<BasketManager> {
        return this.basketManager;
    }

    /**
     * Authenticates a User.
     * @param email The email.
     * @param password The password.
     * @returns The User or undefined.
     */
    public async authenticateUser(email: string, password: string): Promise<User | undefined> {
        return this.userManager.authenticateUser(email, password);
    }

    /**
     * Performs an operation on a User.
     * @param operation The operation.
     * @param userData The user data.
     * @returns True if the operation was successful, otherwise False.
    */
    public async performUserOperation(operationType: OperationType, userData?: Partial<IUser>): Promise<boolean> {
        if (!userData) {
            return false;
        }

        switch (operationType) {
            case OperationType.ADD: {
                // Note: this cast could cause issues
                const user = this.userManager.registerUser(userData as IUser);
                await this.dataWriter.addUser(user);

                await this.dataWriter.addBasket(this.userManager.getUser((user).id)!.basket);

                return true;
            }

            case OperationType.UPDATE:
                await this.dataWriter.updateUser(this.userManager.updateUser(userData as IUser)!);
                return true;

            case OperationType.DELETE:
                if (!userData?.id) {
                    throw new Error("User ID is required for deletion");
                }

                this.userManager.deleteUser(userData.id);
                await this.dataWriter.deleteUser(userData.id.toString());

                this.basketManager.deleteBasket(userData.id);
                await this.dataWriter.deleteBasket(userData.id.toString());

                this.recommendationManagers.delete(userData.id);
                return true;

            default:
                throw new Error("Invalid operation type");
        }
    }

    /**
     * Performs an operation on a Item.
     * @param operation The operation.
     * @param userData The item data.
     * @returns True if the operation was successful, otherwise False.
    */
    public async performItemOperation(operationType: OperationType, itemData: Partial<IItem>): Promise<boolean> {
        if (!itemData) {
            return false;
        }
        
        switch (operationType) {
            case OperationType.ADD:
                await this.dataWriter.addItem(this.itemManager.registerItem(itemData as IItem));
                return true;

            case OperationType.UPDATE: {
                const item = this.itemManager.updateItem(itemData as IItem);

                let basketItem;

                // Update the item in all baskets
                for (const user of this.userManager.getUsers()) {
                    basketItem = this.userManager.updateBasketItem({ basketId: user[1].basket.id, itemId: itemData.id } as IBasketItem);

                    if (basketItem === undefined) {
                        continue;
                    }

                    this.dataWriter.updateBasketItem(basketItem!);
                }

                await this.dataWriter.updateItem(item!);
                return true;
            }

            case OperationType.DELETE:
                if (!itemData?.id) {
                    throw new Error("Item ID is required for deletion");
                }

                this.itemManager.deleteItem(itemData.id);

                // Remove the item from all baskets
                for (const user of this.userManager.getUsers()) {
                    const basketItem = this.userManager.deleteBasketItemFromUser({ basketId: user[1].basket.id, itemId: itemData.id } as IBasketItem);
                    this.dataWriter.deleteBasketItem(basketItem.basketId, basketItem.itemId);
                }
            
                // await this.dataWriter.deleteItemImage(itemData.id.toString());
                await this.dataWriter.deleteItem(itemData.id.toString());
                return true;

            default:
                throw new Error("Invalid operation type");
        }
    }

    /**
     * Performs an operation on a Order.
     * @param operation The operation.
     * @param userId The user ID.
     * @returns True if the operation was successful, otherwise False.
    */
    public async performOrderOperation(operationType: OperationType, userId: string, itemId?: string): Promise<boolean> {
        const user = this.userManager.getUser(userId);

        if (!user) {
            return false;
        }

        switch (operationType) {
            case OperationType.ADD: {

                if (itemId !== undefined) {
                    const item = this.itemManager.getItem(itemId);

                    const itemInBasket = {
                        basketId: user.basket.id,
                        itemId: itemId,
                        quantity: 1,
                        dateAdded: new Date(),
                        userId: userId
                    } as IBasketItem;
                    

                    const itemToPurchase = this.itemManager.updateOrderedItems([itemInBasket], userId, new id().toString());

                    if (itemToPurchase.length === 0) {
                        return false;
                    }

                    const order = this.orderManager.createOrder(userId, itemToPurchase);

                    await this.dataWriter.addOrder(this.userManager.addOrderToUser(userId, order)!);

                    // Update the items to be purchased
                    await this.dataWriter.updateItem(item!);
                }

                else {
                    const itemsInBasket = Array.from(user.basket.getItemsInBasket().values());
                
                    const itemsToPurchase = this.itemManager.updateOrderedItems(itemsInBasket, userId, new id().toString());

                    if (itemsToPurchase.length === 0) {
                        return false;
                    }
                
                    const order = this.orderManager.createOrder(userId, itemsToPurchase);

                    await this.dataWriter.addOrder(this.userManager.addOrderToUser(userId, order)!);
                
                    // Update the items to be purchased
                    for (const item of itemsToPurchase) {
                        await this.dataWriter.updateItem(item);
                    }

                    // We now need to remove BasketItems which we can get using the BasketId and ItemIds
                    for (const item of itemsInBasket) {
                        await this.dataWriter.deleteBasketItem(item.basketId, item.itemId);
                    }

                    this.userManager.clearUserBasket(userId);
                }

                return true;
            }

            case OperationType.UPDATE:
                // TODO: Implement
                return true;

            case OperationType.DELETE:
                // TODO: Implement
                return true;

            default:
                throw new Error("Invalid operation type");
        }
    }

    /**
     * Performs an operation on a Basket.
     * @param operation The operation.
     * @param userData The basket data.
     * @returns True if the operation was successful, otherwise False.
    */
    public async performBasketItemOperation(operationType: OperationType, basketItemData: Partial<IBasketItem>): Promise<boolean> {
        if (!basketItemData) {
            return false;
        }

        switch (operationType) {
            case OperationType.ADD:
                await this.dataWriter.addBasketItem(this.userManager.addBasketItemToUser(basketItemData as IBasketItem));
                return true;

            case OperationType.UPDATE:
                await this.dataWriter.updateBasketItem(this.userManager.updateBasketItem(basketItemData as IBasketItem)!);
                return true;

            case OperationType.DELETE:
                if (!basketItemData?.basketId) {
                    throw new Error("Basket ID is required for deletion");
                }

                this.userManager.deleteBasketItemFromUser(basketItemData as IBasketItem);

                this.basketManager.deleteBasketItem(basketItemData.basketId!, basketItemData.itemId!);

                basketItemData = basketItemData as IBasketItem;
                
                await this.dataWriter.deleteBasketItem(basketItemData.basketId!, basketItemData.itemId!);
                return true;

            default:
                throw new Error("Invalid operation type");
        }
    }

    /**
     * Performs a trade with Items.
     * @param itemId1 The first Item ID.
     * @param itemId2 The second Item ID.
     */
    public async performTradeOperation(itemId1: string, itemId2: string): Promise<boolean> {
        const updatedItems = this.itemManager.tradeItems(itemId1, itemId2);

        await this.dataWriter.updateItem(updatedItems[0]!);
        await this.dataWriter.updateItem(updatedItems[1]!);

        this.loadState();

        return true;
    }
}