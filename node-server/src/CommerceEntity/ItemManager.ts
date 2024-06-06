import { IBasketItem } from "../Interfaces/IBasketItem";
import { IItem } from "../Interfaces/IItem";
import { IItemFilter } from "../Interfaces/IItemFilter";
import { IItemImage } from "../Interfaces/IItemImage";
import { BackendUtils } from "../Utils/BackendUtils";
import { Item } from "./Item";

/**
 * A class that manages Items.
 */
export class ItemManager {
    private DEFAULT_CATEGORIES_CASE = "0,0,0,0,0,0,0,0,0,0,0,0";
    private _items: Map<string, Item>;

    /**
     * Constructs an ItemManager.
     */
    public constructor() {
        this._items = new Map();
    }

    /**
     * Deletes an Item.
     * @param itemId The id of the Item to delete.
     */
    public deleteItem(itemId: string) {
        this._items.delete(itemId);
    }

    /**
     * Adds an Item.
     * @param item The Item to add.
     */
    public addItem(item: IItem) {
        this._items.set(item.id, item as Item);
    }

    /**
     * Gets the Items.
     * @returns The Items.
     */
    public getItems(): Map<string, Item>  {
        return this._items;
    }

    /**
     * Gets an Item
     * @param itemId The id. 
     * @returns The Item or undefined.
     */
    public getItem(itemId: string): Item | undefined {
        for (const item of this._items.values()) {
            if (item.id === itemId) {
                return item;
            }
        }
    }

    // /**
    //  * Adds an image to an Item.
    //  * @param itemImage The image.
    //  */
    // public addImage(itemImage: IItemImage) {
    //     this._items.get(itemImage.id)?.addImage(itemImage);
    // }

    /**
     * Registers the Items and their images.
     * @param items The items.
     * @param itemCategories The categories.
     */
    public registerItems(items: IItem[]) {
        for (const item of items) {
            this.registerItem(item);

            // for (const itemImage of itemImages) {
            //     if (itemImage.id === item.id) {
            //         this.addImage(itemImage);
            //     }
            // }
        }
    }

    /**
     * Registers an Item.
     * @param item The Item to register.
     * @returns The registered Item.
     */
    public registerItem(item: IItem): Item {
        const newItem = this.reconstructItem(item);
        this.addItem(newItem);
        return newItem;
    }

    /**
     * Updates an Item.
     * @param item The Item to update.
     * @returns The updated Item or undefined.
     */
    public updateItem(item: Partial<IItem>): IItem | undefined {
        const itemId = item.id;

        if (!itemId) {
            return;
        }

        const existingItem = this._items.get(itemId);

        if (!existingItem) {
            return;
        }

        existingItem.update(item);
        return existingItem as IItem;
    }

    /**
     * Gets the Items by their ids.
     * @param itemIds The ids.
     * @returns The Items.
     */
    public getItemsByIds(itemIds: string[]): Item[] {
        const items: Item[] = [];

        for (const itemId of itemIds) {
            const item = this.getItem(itemId);

            if (item) {
                items.push(item);
            }
        }

        return items;
    }

    /**
     * Gets/updates the Items that have been ordered.
     * @param purchasedItems The purchased Items.
     * @param buyerId The buyer's id.
     * @param orderId The order's id.
     * @returns The Items.
     */
    public updateOrderedItems(purchasedItems: IBasketItem[], buyerId: string, orderId: string): Item[] {
        const orderItems = this.getItemsByIds(purchasedItems.map((item) => item.itemId));

        for (const item of orderItems) {
            item.isPurchased = true;
            item.buyerId = buyerId;
            item.orderId = orderId;
            item.basketId = null;
        }

        return orderItems;
    }

    /**
     * Gets all Items into alphabetical order..
     * @returns The Items in alphabetical order.
     */
    public getItemsInAlphabeticalOrder(): Item[] {
        return this.setupMergeSort(Array.from(this._items.values()));
    }

    /**
     * Performs a Merge Sort on the Items into alphabetical order.
     * Merge Sort is a type of Divide and Conquer algorithm which recursively divides the Items into two halves, sorts the two halves and then merges them.
     * It works by firstly dividing the Items into two halves - these two halves are further divided into sub arrays that contain a single item.
     * The sub arrays are then sorted and then merged back until we get the final sorted array.
     * @param items The Items to sort.
     * @returns The sorted Items.
     */
    private setupMergeSort(items: Item[]): Item[] {

        // Return once we hit an array with a single item - this is the base case
        if (items.length <= 1) {
            return items;
        }

        // Splits the array into two halves - divide portion
        // Until each array has a single item
        const middle = Math.floor(items.length / 2);
        const leftItem = items.slice(0, middle);
        const rightItem = items.slice(middle);

        // We then recursively call the setupMergeSort function on the two halves to split them further until the base case is reached - where each sub array only contains one item.
        // Once the base case is reached, we can start the merge process.
        // We then merge the items recursively, by merging and sorting the sub arrays until we get the final sorted array.
        // This produces the final sorted items array from the two halves items array.
        return this.mergeSort(
            this.setupMergeSort(leftItem),
            this.setupMergeSort(rightItem)
        );
    }

    /**
     * Merges the two arrays of Items together.
     * @param leftItems The left array.
     * @param rightItems The right array.
     * @returns The merged array.
     */
    private mergeSort(leftItems: Item[], rightItems: Item[]): Item[] {
        const results = [];
        let leftIndex = 0;
        let rightIndex = 0;

        // Conquer portion - we compare the elements of the two arrays and merge them together
        // The leftIndex and rightIndex are used to track the current index of the two sub arrays
        while (leftIndex < leftItems.length && rightIndex < rightItems.length) {
            const leftItemName = leftItems[leftIndex].name.toLowerCase();
            const rightItemName = rightItems[rightIndex].name.toLowerCase();

            const isLeftItemCharALetter = this.isFirstCharALetter(leftItemName);
            const isRightItemCharALetter = this.isFirstCharALetter(rightItemName);
    
            // The items with the starting letter char should be first
            // If the first char from the left is a letter, add that first
            if (isLeftItemCharALetter && !isRightItemCharALetter) {
                results.push(leftItems[leftIndex]);
                leftIndex++;
            }
            
            // If the first char from the right is a letter, add that first
            else if (!isLeftItemCharALetter && isRightItemCharALetter) {
                results.push(rightItems[rightIndex]);
                rightIndex++;
            }
            
            // Otherwise, if both item starting chars are letters, then we compare them using alphabetical order
            else {
                if (leftItemName.localeCompare(rightItemName) < 0) {
                    results.push(leftItems[leftIndex]);
                    leftIndex++;
                } else {
                    results.push(rightItems[rightIndex]);
                    rightIndex++;
                }
            }
        }
    
        
        // We then concatenate the remaining elements of the two arrays
        // If one of the arrays is empty, then just copy the other one
        return results
            .concat(leftItems.slice(leftIndex))
            .concat(rightItems.slice(rightIndex));
    }

    /**
     * Checks if the start of a string is a letter
     * @param stringToCheck The string.
     * @returns True if the first character is a letter, false otherwise.
     */
    private isFirstCharALetter(stringToCheck: string): boolean {
        const firstChar = stringToCheck.charAt(0).toLowerCase();

        // Returns true if the first character is a letter
        return firstChar >= "a" && firstChar <= "z";
    }

    /**
     * Gets an Item by its name using a Binary Search 
     * We sort the items with the Merge Sort.
     * Binary Search works by checking the middle item in the item array.
     * If the searched item name is greater than the middle item name in the alphabet, then we search the right half of the array - otherwise we check the left half.
     * We then disregard the unused items, and get the next middle item to compare.
     * This process continues halves the number of items to search find the item.
     * @param itemName The name.
     * @returns The Item or null.
     */
    public getItemByNameUsingBinarySearch(itemName: string): Item | null {
        const itemsArray = Array.from(this._items.values());
        const sortedItems = this.setupMergeSort(itemsArray);

        let lowIndex = 0;
        let highIndex = sortedItems.length - 1;

        while (lowIndex <= highIndex) {

            // Get the middle item between the low and high index
            const midIndex = Math.floor((lowIndex + highIndex) / 2);
            const midItem = sortedItems[midIndex];
            const midItemName = midItem.name.toLowerCase();

            if (midItemName.toLowerCase() === itemName.toLowerCase()) {
                return midItem;
            }

            // If name is greater than the middle item, then search the right half
            else if (midItemName < itemName) {
                lowIndex = midIndex + 1;
            }
            
            // Otherwise, search the left half
            else {
                highIndex = midIndex - 1;
            }
        }

        return null;
    }

    /**
     * Gets the newest and available Items.
     * @returns The Items.
     */
    public getNewestAndAvailableItems(): Item[] {
        const items = Array.from(this._items.values());

        // Get the items that have not been purchased and sort them by the newest date added
        return items
            .filter((item) => !item.isPurchased)
            .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
    }

    /**
     * Gets the Items not being sold by the User and are available
     * @param userId The User's id.
     * @returns The Items.
     */
    public getItemsFromAllOtherSellers(userId: string): Item[] {
        const items = Array.from(this._items.values());

        return items.filter((item) => item.sellerId !== userId && !item.isPurchased);
    }

    /**
     * Gets the Items that not sold from the User.
     * @param userId The User's id.
     * @returns The Items.
     */
    public getSellerUnsoldItems(userId: string): Item[] | null {
        const sellerItems: Item[] = [];

        for (const item of this._items.values()) {
            if (item.sellerId === userId && !item.isPurchased) {
                sellerItems.push(item);
            }
        }

        if (sellerItems.length === 0) {
            return null;
        }

        sellerItems.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        
        return sellerItems;
    }

    /**
     * Gets the Items that have been sold by the User.
     * @param userId The User's id.
     * @returns The Items.
     */
    public getSellerSoldItems(userId: string): Item[] | null {
        const sellerItems: Item[] = [];

        for (const item of this._items.values()) {
            if (item.sellerId === userId && item.isPurchased) {
                sellerItems.push(item);
            }
        }

        if (sellerItems.length === 0) {
            return null;
        }

        sellerItems.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());

        return sellerItems;
    }
    
    /**
     * Updates the rating of an Item.
     * @param itemId The id.
     * @param rating The new rating.
     * @returns The updated Item or undefined.
     */
    public updateRating(itemId: string, rating: number): Item | undefined {
        const item = this._items.get(itemId);

        if (!item) {
            return;
        }

        item.updateRating(rating);

        return item;
    }

    /**
     * Gets the filtered Items .
     * @param filter what we should filter by.
     * @returns The filtered Items.
     */
    public filterItems(filter: IItemFilter): Item[] {
        const items = Array.from(this._items.values());
        let filteredItems: Item[] = [];

        const category = filter.categories;
        const price = filter.price;
        const rating = filter.rating;

        // If the categories are undefined or are the default then use all the items
        if (category === undefined || category === this.DEFAULT_CATEGORIES_CASE) {
            filteredItems = items;
        } else {
            const chosenCategories = BackendUtils.convertEncodedCategoriesToSet(category);

            for (const item of items) {
                for (const chosenCategory of chosenCategories) {
                    if (item.categories.has(chosenCategory)) {
                        filteredItems.push(item);
                        break;
                    }
                }
            }
        }

        if (price === "highest") {
            filteredItems.sort((a, b) => b.price - a.price);
        }

        if (price === "lowest") {
            filteredItems.sort((a, b) => a.price - b.price);
        }

        if (rating === "highest") {
            filteredItems.sort((a, b) => b.averageRating - a.averageRating);
        }

        if (rating === "lowest") {
            filteredItems.sort((a, b) => a.averageRating - b.averageRating);
        }

        return filteredItems;
    }

    /**
     * Gets the highest rated Items - that have 3 or higher.
     * @returns The rated Items.
     */
    public getHighestRatedItems(): Item[] {
        const items = Array.from(this._items.values());

        const filteredItems = items.filter((item) => item.averageRating >= 3);

        filteredItems.sort((a, b) => b.averageRating - a.averageRating);

        return filteredItems;
    }

    /**
     * Performs a trade between two Items.
     * @param item1Id An Item's id.
     * @param item2Id Trade Item's id.
     * @returns An array of the traded Items.
     */
    public tradeItems(item1Id: string, item2Id: string): Item[] {
        const item1 = this.getItem(item1Id);
        const item2 = this.getItem(item2Id);

        if (!item1 || !item2) {
            return [];
        }

        const item1SellerId = item1.sellerId;
        const item2SellerId = item2.sellerId;

        item1.sellerId = item2SellerId;
        item2.sellerId = item1SellerId;

        return [item1, item2];
    }

    /**
     * Calls the Item's constructor.
     * Note: this is a workaround as TypeScript casts the database data to an Item which does not actually call Item's constructor.
     * @param item The Item to reconstruct.
     * @returns The reconstructed Item.
     */
    private reconstructItem(item: IItem) {
        return new Item(
            item.name,
            item.price,
            item.description,
            item.quantityAvailable,
            item.isPurchased,
            item.sellerId,
            item.encodedCategories,
            item.averageRating,
            item.numOfRatings,
            item.buyerId,
            item.orderId,
            item.basketId,
            item.dateAdded || new Date(),
            item.image,
            item.id
        );
    }
}