import { CategoriesEnum } from "../CommerceEntity/Recommendations/CategoriesEnum";

/**
 * A utility class for the backend.
 */
export class BackendUtils {

    /**
     * Converts the string of encoded categories to a set of categories.
     * @param encodedCategories The encoded categories.
     * @returns 
     */
    public static convertEncodedCategoriesToSet(encodedCategories: string): Set<CategoriesEnum> {
        const categoriesSet = new Set<CategoriesEnum>();

        if (encodedCategories == "") {
            return categoriesSet;
        }

        // If the encoded categories string is not the same length as the number of categories, remove the commas.
        if (encodedCategories.length !== Object.keys(CategoriesEnum).length) {
            encodedCategories = encodedCategories.split(",").join("");
        }

        // Converts the encoded categories to the stringified version
        for (let i = 0; i < encodedCategories.length; i++) {
            if (Number(encodedCategories.charAt(i)) === 1) {
                categoriesSet.add(Object.keys(CategoriesEnum).at(i) as CategoriesEnum);
            }
        }

        return categoriesSet;
    }

    /**
     * Converts the set of categories to a string of encoded categories.
     * @param categories The categories.
     * @returns The encoded categories.
     */
    public static convertSetToEncodedCategories(categories: Set<CategoriesEnum>): string {
        let encodedCategories = "";

        // Encode the stringified categories to a string where 1 represents the category exists and 0 otherwise.
        Object.values(CategoriesEnum).forEach(category => {
            if (typeof category === "string") {
                encodedCategories += categories.has(category as unknown as CategoriesEnum) ? "1" : "0";
            }
        });

        return encodedCategories;
    }
}