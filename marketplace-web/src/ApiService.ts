import { IBasket } from "./Interfaces/IBasket";
import { IBasketItem } from "./Interfaces/IBasketItem";
import { IItem } from "./Interfaces/IItem";
import { IItemFilter } from "./Interfaces/IItemFilter";
import { IItemInBasket } from "./Interfaces/IItemInBasket";
import { IOrder } from "./Interfaces/IOrder";
import { IUser } from "./Interfaces/IUser";

export const API_ENDPOINTS = {
    session: "http://localhost:5000/api/session",
    login: "http://localhost:5000/api/login",
    logout: "http://localhost:5000/api/logout",
    user: "http://localhost:5000/api/user/profile",
    items: "http://localhost:5000/api/items",
    itemsAlphabetical: "http://localhost:5000/api/items/alphabetical",
    item: "http://localhost:5000/api/item",
    itemName: "http://localhost:5000/api/item/name",
    basket: "http://localhost:5000/api/user/basket",
    itemsInBasket: "http://localhost:5000/api/user/basket/items",
    checkout: "http://localhost:5000/api/user/basket/checkout",
    checkoutItem: "http://localhost:5000/api/user/basket/quickcheckout",
    order: "http://localhost:5000/api/user/neworder",
    userorders: "http://localhost:5000/api/user/orders",
    newItems: "http://localhost:5000/api/items/newest",
    recommendations: "http://localhost:5000/api/user/recommendations",
    recommendationsCategories: "http://localhost:5000/api/user/recommendations/categories",
    sellerUnsold: "http://localhost:5000/api/seller/items/unsold",
    sellerSold: "http://localhost:5000/api/seller/items/sold",
    addRating: "http://localhost:5000/api/item/rating",
    filterItems: "http://localhost:5000/api/items/filter",
    highestRatedItems: "http://localhost:5000/api/items/rated/highest",
    tradeItems: "http://localhost:5000/api/item/trade"
};

/**
 * API Service for interacting with the backend.
 */
export class ApiService {


    // Sessions Functions

    /**
     * Checks if a session exists
     * @returns True if a session exists, otherwise False.
     */
    public static async doesSessionExist(): Promise<boolean> {
        try {

            // Send a request to the backend to check if a session exists where the credentials refers to the session cookie
            const response = await fetch(API_ENDPOINTS.session, {
                credentials: "include"
            });
    
            const jsonData = await response.json();
            console.log(jsonData);
            return jsonData.isLoggedIn;
        } catch (error) {
            console.error("Failed to check session:", error);
            return false;
        }
    }

    /**
     * Makes a request to the backend to logout.
     * @returns True if the session was logged out, otherwise False.
     */
    public static async logoutSession(): Promise<boolean> {
        try {
            const response = await fetch(API_ENDPOINTS.logout, {
                method: "POST",
                credentials: "include"
            });

            const jsonData = await response.json();
            console.log(jsonData);
            return jsonData.success;
        } catch (error) {
            console.error("Failed to logout session:", error);
            return false;
        }
    }

    /**
     * Sends a request to the backend to login.
     * @param email The email.
     * @param password The password.
     * @returns True if the login was successful, otherwise False.
     */
    public static async postLogin(email: string, password: string) {

        // Send the email and password to the backend
        try {
            const response = await fetch(API_ENDPOINTS.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",

                body: JSON.stringify({ email, password })
            });

            console.log("Response:", response);

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data);
                return true;
            }

            return false;

        } catch (error) {
            console.error("There was an error logging in:", error);
            return false;
        }
    }

    // User Functions

    /**
     * Gets the User from the API.
     * @returns The User or null.
     */
    public static async getUserFromApi(): Promise<IUser> {
        try {
            const response = await fetch(API_ENDPOINTS.user, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            console.log("Response:", response);

            if (!response.ok) {
                console.error(`Error fetching user: ${response.status}`);
                return null;
            }

            const user = await response.json() as IUser;

            console.log("Response:", user);
            return user;

        } catch (error) {
            console.error("There was an error fetching the user details:", error);
        }
    }

    /**
     * Sends a request to the backend to create a User.
     * @param userData The User data.
     * @returns True if the User was created, otherwise False.
     */
    public static async createUser(userData: Partial<IUser>): Promise<boolean> {
        try {
            const response = await fetch(API_ENDPOINTS.user, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                console.error(`Error creating user: ${response.status}`);
                return false;
            }

            return true;

        } catch (error) {
            console.error("There was an error creating the user:", error);
        }

        return false;
    }

    /**
     * Updates the User data and sets the new data to the backend.
     * @param userData The updated User data.
     * @returns True if the User data was updated, otherwise False.
     */
    public static async updateUserData(userData: Partial<IUser>): Promise<boolean> {
        try {
            const response = await fetch(API_ENDPOINTS.user, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                console.error(`Error updating user data: ${response.status}`);
                return false;
            }

            return true;

        } catch (error) {
            console.error("There was an error updating the user data:", error);
        }

        return false;
    }

    /**
     * Sends a request to the backend to delete the User data.
     * @returns True if the User data was deleted, otherwise False.
     */
    public static async deleteUserData(): Promise<boolean> {
        try {
            const response = await fetch(API_ENDPOINTS.user, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });

            if (!response.ok) {
                console.error(`Error deleting user data: ${response.status}`);
                return false;
            }

            return true;

        } catch (error) {
            console.error("There was an error deleting the user data:", error);
        }

        return false;
    }


    // Item Functions

    /**
     * Gets the Items from the API.
     * @returns The Item data
     */
    public static async getItemsFromApi(): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.items, {
            credentials: "include"
        });

        const jsonData = await response.json();
        return jsonData.item;
    }

    /**
     * Gets the Items in alphabetical order.
     * @returns The Items in alphabetical order.
     */
    public static async getItemsInAlphabeticalOrder(): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.itemsAlphabetical, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting items: ${response.status}`);
            throw new Error(`Error getting items: ${response.status}`);
        }

        const items = await response.json() as IItem[];
        return items;
    }

    /**
     * Sends a request to the backend to create an Item.
     * @param item The item to be created.
     * @returns True if the Item was created, otherwise False.
     */
    public static async createItem(item: Partial<IItem>): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.item, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item),
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error adding item: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Sends a request to the backend to update an Item.
     * @param item The Item data.
     * @returns True if the Item was updated, otherwise False.
     */
    public static async updateItemData(item: Partial<IItem>): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.item, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item),
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error updating item: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Sends a request to the backend to delete an Item.
     * @param item The Item ID.
     * @returns True if the Item was deleted, otherwise False.
     */
    public static async deleteItem(itemId: string): Promise<boolean> {
        const response = await fetch(`${API_ENDPOINTS.item}/${itemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error deleting item: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Sends a request to the backend to get an Item.
     * @param item The Item..
     * @returns The Item if it was received, otherwise null.
     */
    public static async getItemWithId(itemId: string): Promise<IItem | null> {
        try {
            const response = await fetch(`${API_ENDPOINTS.item}/${itemId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            });
    
            if (!response.ok) {
                console.error(`Error getting item: ${response.status}`);
                throw new Error(`Error getting item: ${response.status}`);
            }
    
            const itemData = await response.json() as IItem;
            return itemData;
        } catch (error) {
            console.error("Error fetching item:", error);
            return null;
        }
    }

    /**
     * Sends a request to the backend to get an Item by name.
     * @param itemName The name of the Item.
     * @returns The Item if it was received, otherwise null.
     */
    public static async getItemByName(itemName: string): Promise<IItem | null> {
        const response = await fetch(`${API_ENDPOINTS.itemName}/${itemName}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        
        const itemData = await response.json();

        if (itemData === null) {
            return null;
        }

        return itemData as IItem;
    }

    /**
     * Gets the newest and available Items.
     * @returns The Items.
     */
    public static async getNewestAndAvailableItems(): Promise<IItem[]> {
        const response = await fetch(`${API_ENDPOINTS.newItems}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        
        const itemData = await response.json();

        return itemData as IItem[];
    }

    /**
     * Sends a request to the backend to get the User's recommended items.
     * @returns TThe recommended items.
     */
    public static async getRecommendedItems(): Promise<IItem[]> {
        const response = await fetch(`${API_ENDPOINTS.recommendations}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error getting recommended items: ${response.status}`);
            throw new Error(`Error getting recommended items: ${response.status}`);
        }

        const items = await response.json() as IItem[];
        return items;
    }

    /**
     * Sends a request to the backend to get the User's purchased item categories.
     * @param category The category.
     * @returns The recommended items.
     */
    public static async getUserPurchasedCategories(): Promise<string> {
        const response = await fetch(`${API_ENDPOINTS.recommendationsCategories}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error getting recommended items by category: ${response.status}`);
            throw new Error(`Error getting recommended items by category: ${response.status}`);
        }

        const items = await response.json() as string;

        console.log("Items:", items);
        return items;
    }

    
    // Basket Functions

    /**
     * Sends a request to the backend to get the User's Basket.
     * @returns The Basket data.
     */
    public static async getBasketFromApi(): Promise<IBasket> {
        const response = await fetch(API_ENDPOINTS.basket, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const basketData = await response.json() as IBasket;
        console.log(basketData);
        return basketData;
    }

    /**
     * Sends a request to the backend to add an Item to the User's Basket.
     * @param itemId The ID of the Item to add.
     * @returns True if the Item was added to the Basket, otherwise False.
     */
    public static async addToBasket(itemId: string): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.basket, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ itemId })
        });

        if (!response.ok) {
            console.error(`Error adding item to basket: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Gets all the Items in the User's Basket.
     * @returns The Items in the User's Basket.
     */
    public static async getItemsInUserBasket(): Promise<IItemInBasket[]> {
        const response = await fetch(API_ENDPOINTS.itemsInBasket, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"

        });

        const basketItem = await response.json() as IBasketItem[];

        const itemsInUserBasket: IItemInBasket[] = [];

        for (const bItem of basketItem) {

            const item = await ApiService.getItemWithId(bItem.itemId);

            itemsInUserBasket.push({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                quantityAvailable: item.quantityAvailable,
                sellerId: item.sellerId,
                buyerId: item.buyerId,
                orderId: item.orderId,
                basketId: item.basketId,
                encodedCategories: item.encodedCategories,
                quantity: bItem.quantity,
                dateAdded: bItem.dateAdded
            } as IItemInBasket);
        }

        return itemsInUserBasket;
    }

    /**
     * Checks if an Item is in the User's Basket.
     * @param itemId The ID of the Item.
     * @returns True if the Item is in the Basket, otherwise False.
     */
    public static async isItemInBasket(itemId: string): Promise<boolean> {

        // Check if the item is already in the basket
        // Note: there may be a race condition here
        const basketItems = await ApiService.getItemsInUserBasket();
        const itemInBasket = basketItems.find(item => item.id === itemId);


        // If item is in the basket, return true
        if (itemInBasket) {
            console.log("herte:", itemInBasket);
            return true;
        }

        return false;
    }

    /**
     * Removes an Item from the User's Basket.
     * @param itemId The ID of the Item to remove.
     * @returns True if the Item was removed, otherwise False.
     */
    public static async removeFromBasket(itemId: string): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.basket, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itemId }),
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error removing item from basket: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Checks out the User's Basket.
     * @returns True if the Basket was checked out, otherwise False.
     */
    public static async checkoutBasket(): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.checkout, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error checking out basket: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Checks out a single Item.
     * @param itemId The ID of the Item.
     * @returns True if the Item was checked out, otherwise False.
     */
    public static async checkoutItem(itemId: string): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.checkoutItem, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itemId }),
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error checking out item: ${response.status}`);
            return false;
        }

        return true;
    }


    // Order Functions

    /**
     * Gets the most recent order.
     * @returns The most recent order.
     */
    public static async getOrderDetails(): Promise<IOrder> {
        const response = await fetch(API_ENDPOINTS.order, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting order details: ${response.status}`);
            throw new Error(`Error getting order details: ${response.status}`);
        }

        const orderData = await response.json() as IOrder;
        return orderData;
    }

    /**
     * Gets the User's orders.
     * @returns The User's orders.
     */
    public static async getUserOrders(): Promise<IOrder[]> {
        const response = await fetch(API_ENDPOINTS.userorders, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting user orders: ${response.status}`);
            throw new Error(`Error getting user orders: ${response.status}`);
        }

        const orders = await response.json() as IOrder[];
        return orders;
    }


    // Item/Seller Functions

    /**
     * Gets the User's unsold items.
     * @returns The User's unsold items.
     */
    public static async getUserUnsoldItems(): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.sellerUnsold, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting unsold items: ${response.status}`);
            throw new Error(`Error getting unsold items: ${response.status}`);
        }

        const items = await response.json() as IItem[];
        return items;
    }

    /**
     * Gets the User's sold items.
     * @returns The User's sold items.
     */
    public static async getUserSoldItems(): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.sellerSold, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting sold items: ${response.status}`);
            throw new Error(`Error getting sold items: ${response.status}`);
        }

        const items = await response.json() as IItem[];

        return items;
    }

    /**
     * Adds a rating to an item.
     * @param itemId The ID of the Item.
     * @param rating The rating.
     * @returns True if the rating was added, otherwise False.
     */
    public static async addItemRating(itemId: string, rating: number): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.addRating, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itemId, rating }),
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error adding rating to item: ${response.status}`);
            return false;
        }

        return true;
    }

    /**
     * Gets the filtered items.
     * @param filter The filter.
     * @returns The filtered items.
     */
    public static async getFilteredItems(filter: IItemFilter): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.filterItems, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filter),
            credentials: "include",
        });

        if (!response.ok) {
            console.error(`Error getting filtered items: ${response.status}`);
            throw new Error(`Error getting filtered items: ${response.status}`);
        }

        const items = await response.json() as IItem[];
        return items;
    }

    /**
     * Gets the highest rated items.
     * @returns The highest rated items.
     */
    public static async getHighestRatedItems(): Promise<IItem[]> {
        const response = await fetch(API_ENDPOINTS.highestRatedItems, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error getting highest rated items: ${response.status}`);
            throw new Error(`Error getting highest rated items: ${response.status}`);
        }

        const items = await response.json() as IItem[];

        return items;
    }

    /**
     * Trades items.
     * @param itemId The ID of the Item.
     * @param idToTrade The ID of the Item to trade.
     * @returns True if the items were traded, otherwise False.
     */
    public static async tradeItems(itemId: string, idToTrade: string): Promise<boolean> {
        const response = await fetch(API_ENDPOINTS.tradeItems, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itemId, idToTrade }),
            credentials: "include"
        });

        if (!response.ok) {
            console.error(`Error trading items: ${response.status}`);
            return false;
        }

        return true;
    }
}