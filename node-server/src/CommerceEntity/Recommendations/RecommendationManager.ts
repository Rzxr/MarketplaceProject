import { BackendUtils } from "../../Utils/BackendUtils";
import { Item } from "../Item";
import { User } from "../User";
import { CategoriesEnum } from "./CategoriesEnum";

/**
 * A class that represents the RecommendationManager System of the Marketplace.
 * This uses K Nearest Neighbours to find the most similar items to the current user.
 */
export class RecommendationManager {
    private _user: User;
    private _allItemsNotFromUser: Item[];

    private _allCategories: Set<string | CategoriesEnum> = new Set(Object.values(CategoriesEnum));

    /**
     * Constructs a RecommendationManager.
     * @param user The User.
     * @param allItemsNotFromUser All Items in the Marketplace.
     */
    public constructor(user: User, allItemsNotFromUser: Item[]) {
        this._user = user;
        this._allItemsNotFromUser = allItemsNotFromUser;
    }

    /**
     * Loops through the User's categories and finds the most similar items.
     * Uses KNN to find the most similar items.
     * @param k The number of items to recommend.
     * @returns A map of recommended items.
     */
    public findRecommendedItems(k: number = 5): Map<string, Item> {
        const userCategories = this._user.interestedCategories;

        // Update the user's preferences based on orders
        this.updateUserPreferencesBasedOnOrders(this._user.getAllItemsFromOrders() as Item[]);

        // Create vector for the user
        const userVector = this.createUserVector(userCategories);

        // Stores an array of Items and scores
        const similarityScores: { item: Item; score: number }[] = [];

        // Find the similarity between the user vector and all item vectors with Items not created by the User
        for (const item of this._allItemsNotFromUser) {
            const itemVector = this.createItemVector(item);

            // Produces a score for the similarity between the user and item vectors
            const score = this.calculateSimilarity(userVector, itemVector);

            // Add the item and score to the similarity scores
            similarityScores.push({ item, score });
        }

        // Sort by similarity score in descending order so that the most similar items (the ones that are closest to 1) are first
        similarityScores.sort((a, b) => b.score - a.score);
        
        const recommendedItems = new Map<string, Item>();

        // Get the first 5 items from the similarity scores
        similarityScores.slice(0, k).forEach(score => recommendedItems.set(score.item.id, score.item));

        return recommendedItems;
    }

    /**
     * Updates the recommendations with updated items.
     * @param items The new items.
     */
    public updateRecommendations(items: Item[]): void {
        this._allItemsNotFromUser = items;
    }

    /**
     * Convert user preferences into a vector using one hot encoding - each category that a User is interested in is set as 1.
     * @param preferences User preferences.
     * @returns A vector representing the user's preferences.
     */
    public createUserVector(userPreferences: Set<CategoriesEnum>): number[] {
        const userVector = new Array(this._allCategories.size).fill(0);

        // Set the vector to 1 for each category that the user is interested in
        for (const category of userPreferences) {
            const categoryIndex = Array.from(this._allCategories).indexOf(category);

            if (categoryIndex !== -1) {
                userVector[categoryIndex] = 1;
            }
        }
        
        return userVector;
    }

    /**
     * Get the categories of the items that the User has purchased.
     * @returns An array of categories.
     */
    public getUserPurchasedCategories(): string {
        const userPurchasedItems = this._user.getAllItemsFromOrders() as Item[];

        const userPurchasedCategories = new Set<CategoriesEnum>();

        userPurchasedItems.forEach(item => {
            item.categories.forEach(category => userPurchasedCategories.add(category));
        });

        return BackendUtils.convertSetToEncodedCategories(userPurchasedCategories);
    }

    /**
     * Get the categories of the items that the User has purchased from the most recent order.
     * @returns An array of categories.
     */
    public getUserCategoriesFromNewestOrder(): string {
        const userPurchasedItems = this._user.getMostRecentOrder()?.items as Item[];

        const userPurchasedCategories = new Set<CategoriesEnum>();

        userPurchasedItems.forEach(item => {
            item.categories.forEach(category => userPurchasedCategories.add(category));
        });

        return BackendUtils.convertSetToEncodedCategories(userPurchasedCategories);
    }

    /**
     * Convert item attributes into a vector.
     * @param item An item.
     * @returns A feature vector representing the item's attributes.
     */
    public createItemVector(item: Item): number[] {
        const itemVector = new Array(this._allCategories.size).fill(0);

        // Loop through each category and set our vector to 1 if that category exists on the Item 
        item.categories.forEach(category => {
            const categoryIndex = Array.from(this._allCategories).indexOf(category);

            if (categoryIndex !== -1) {
                itemVector[categoryIndex] = 1;
            }
        });

        return itemVector;
    }

    /**
     * Calculate similarity between the User and Item Vectors.
     * This is done using the Cosine Similarity which measures the cosine of the angle between two vectors.
     * This function essentially looks at the vectors in a Euclidean space and compares if they are pointing in the same direction.
     * Using the angle between the vectors, we can determine how similar they are - the closer to 1 (or 0 degrees), the more similar they are.
     * For right angle triangles, we could use cos(theta) = adjacent / hypotenuse but for vectors we use cos(theta) = dot product / (magnitude of vector1 * magnitude of vector2).
     * @param userVector The User Vector.
     * @param itemVector The Item Vector.
     * @returns A similarity score.
     */
    public calculateSimilarity(userVector: number[], itemVector: number[]): number {

        // Dot product = sum of the product of the corresponding elements of the two vectors
        // Goes through each elemnt in the userVector and itemVector and multiplies them together and adds them to the sum to produce the dot product
        const dotProduct = userVector.reduce((sum, current, index) => sum + (current * itemVector[index]), 0);

        // Magnitude of a vector = square root of the sum of the squares of the elements
        // For getting the magnitude, we iterate through each element in the vector, square it and add it to the sum.
        // We then take the square root of the sum to get the magnitude.
        const userVectorMagnitude = Math.sqrt(userVector.reduce((sum, current) => sum + (current ** 2), 0));
        const itemVectorMagnitude = Math.sqrt(itemVector.reduce((sum, current) => sum + (current ** 2), 0));

        // Cosine similarity = dot product / (magnitude of user vector * magnitude of item vector).
        // Cosine similarity of 1 means that the vectors are pointing in the same direction.
        // Score close to 0 means that the vectors are orthogonal and of no match.

        // If one of the magnitudes is 0, then return
        if (userVectorMagnitude === 0 || itemVectorMagnitude === 0) {
            return 0;
        }

        // Calculate the cosine similarity using the cosine similarity formula
        return dotProduct / (userVectorMagnitude * itemVectorMagnitude);
    }

    /**
     * Update the User's preferences based on the ordered items.
     * @param orderedItems The ordered items.
     */
    public updateUserPreferencesBasedOnOrders(orderedItems: Item[]): void {

        // Goes through the items in the orders and adds the categories to the User's interested categories
        orderedItems.forEach(item => {
            item.categories.forEach(category => {
                this._user.interestedCategories.add(category);
            });
        });
    }
}
