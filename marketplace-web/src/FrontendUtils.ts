import { IItem } from "./Interfaces/IItem";
import BasketIcon from "../icons/BasketIcon.png";

/**
 * Enum for the categories of the products.
 */
export enum CategoriesEnum {
    ELECTRONICS = "ELECTRONICS",
    CLOTHING = "CLOTHING",
    SPORTS = "SPORTS",
    GAMING = "GAMING",
    PC = "PC",
    BOOKS = "BOOKS",
    MOVIES = "MOVIES",
    MUSIC = "MUSIC",
    GARDEN = "GARDEN",
    PETS = "PETS",
    PHONES = "PHONES",
    FOOD = "FOOD",
}

/**
 * A class containing utility methods for the frontend.
 */
export class FrontendUtil {

    /**
     * Shows a validation error for the input element.
     * @param inputWithError The input element to show the validation error for.
     * @param errorMessage The message.
     */
    public static showValidationError(inputWithError: HTMLInputElement, errorMessage: string) {

        // Create or find an error message element
        let errorElement = inputWithError.nextElementSibling as HTMLElement;
    
        if (!errorElement || !errorElement.classList.contains("error-message")) {
            errorElement = document.createElement("div");
            errorElement.classList.add("error-message");
            inputWithError.parentNode.insertBefore(errorElement, inputWithError.nextSibling);
        }
    
        errorElement.textContent = errorMessage;
        inputWithError.classList.add("error");
        errorElement.style.color = "red";
        errorElement.style.padding = "1% 0 0 0";
    
        inputWithError.focus();
    }
    
    /**
     * Clears the validation error for the input element.
     * @param validatedInput The validated input element.
     */
    public static clearValidationError(validatedInput: HTMLInputElement) {
        const errorElement = validatedInput.nextElementSibling;
    
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.textContent = "";
        }
    
        validatedInput.classList.remove("error");
    }

    /**
     * Clears all validation error messages from the page.
     */
    public static clearAllValidationErrors() {
        const errorElements = document.querySelectorAll(".error-message");

        errorElements.forEach(errorElement => {
            errorElement.textContent = "";
        });
    }

    /**
     * Converts the status of the checkboxes to a one hot encoding array.
     * @param checkboxStatuses The status of the checkboxes.
     * @returns The one hot encoded array.
     */
    public static checkboxesToOneHotEncoding(checkboxStatuses: { id: string, checked: boolean }[]): number[] {

        // Get the number of categories available by getting the keys of the enum
        const lengthOfCategories = Object.keys(CategoriesEnum).filter(key => isNaN(Number(key))).length;
        
        const oneHotEncoding = new Array(lengthOfCategories).fill(0);
        oneHotEncoding.fill(0);

        // Loop through the checkboxes and set the one hot encoding element to 1 if the checkbox is checked
        let position = 0;
        for (const status of checkboxStatuses) {
            if (status.checked) {
                oneHotEncoding[position] = 1;
            }

            position++;
        }
        return oneHotEncoding;
    }

    /**
     * Redirects to the login page.
     */
    public static redirectToLogin() {
        window.location.href = "/Login.html";
    }

    /**
     * Validates the email.
     * @param email The email.
     * @param userEmail The user's email.
     * @returns True if the email is valid, otherwise False.
     */
    public static validateEmail(email: string, userEmail: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && userEmail !== email;
    }

    /**
     * Validates the password.
     * @param newPassword The new password.
     * @param confirmedPasswordInput The confirmed password.
     * @returns True if the password is valid, otherwise False.
     */
    public static validatePassword(newPassword: string, confirmedPasswordInput: string): boolean {
        return newPassword.length > 7 && newPassword === confirmedPasswordInput;
    }

    /**
     * Vaidates the address.
     * @param address The new address.
     * @param userAddress The user's address.
     * @returns True if the address is valid, otherwise False.
     */
    public static validateAddress(address: string, userAddress: string): boolean {
        return address.length > 0 && userAddress !== address;
    }

    /**
     * Shows the success message.
     * @param message The message to show.
     * @param groupContainer The group container.
     * @param timeout The timeout.
     */
    public static showSuccessMessage(message: string, groupContainer: HTMLDivElement, timeout?: number, urlToDirectTo?: string) {
        const successMessage = document.createElement("div");
        successMessage.textContent = message;
        successMessage.className = "success-message";
    
        if (groupContainer && groupContainer.parentNode) {
            groupContainer.parentNode.insertBefore(successMessage, groupContainer);
        }
    
        successMessage.style.color = "green";
        successMessage.style.padding = "1%";
        successMessage.style.margin = "0 1em";
        successMessage.style.fontWeight = "bold";
        successMessage.style.fontSize = "1em";
    
        // Get the window to scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    
        // Clear the message after 5 seconds
        setTimeout(() => {
            successMessage.remove();

            if (urlToDirectTo) {
                window.location.href = urlToDirectTo;
            }
        }, timeout ?? 5000);
    }

    /**
     * Validates the price.
     * @param price The price to validate.
     * @returns True if the price is valid, otherwise False.
     */
    public static isPriceValid(price: string) {
        const regex = /^\d+(\.\d{0,2})?$/;
        return regex.test(price) && parseFloat(price) > 0;
    }
    
    /**
     * Gets the status of the checkboxes.
     * @returns An array that contains which checkboxes are checked.
     */
    public static getCheckboxStatuses(): { id: string, checked: boolean }[] {

        // Queries all input elements of checkbox type
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");
            
        const statuses = Array.from(checkboxes).map(checkbox => {
            return {
                id: checkbox.id,
                checked: checkbox.checked
            };
        });
    
        return statuses;
    }

    /**
     * Clears the checkboxes.
     */
    public static clearCheckboxes() {
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    /**
     * Gets if any of the checkboxes have been checked.
     * @returns If any of the checkbox have actually been checked.
     */
    public static isCheckboxChecked = () =>
        this.getCheckboxStatuses().some(status => status.checked);

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
     * Formats the category string so that the chars other than the first char are not capitalised.
     * @param category The category to format.
     * @returns The formatted category.
     */
    public static formatCategories(category: string): string {
        let formattedCategory = "";

        for (let charIndex = 0; charIndex < category.length; charIndex++) {
            if (charIndex === 0) {
                formattedCategory += category.charAt(charIndex);
                continue;
            }

            formattedCategory += category.charAt(charIndex).toLowerCase();

        }

        return formattedCategory;
    }

    /**
     * Handles clicks on caroussel buttons.
     * @param event The event.
     * @param direction 1 or -1 for right or left.
     * @param carouselName The name of the carousel.
     */
    public static handleCarouselClick(event: Event, direction: number, carouselName: string): void {
        const button = event.currentTarget as HTMLButtonElement;
        const carouselContainer = button.closest(".carousel-container") as HTMLDivElement;
        const itemRow = carouselContainer.querySelector(carouselName) as HTMLDivElement;

        const items = itemRow.children;

        if (items.length === 0) {
            return;
        }

        // Get the full width of the item div
        const itemWidth = items[0].getBoundingClientRect().width;

        // Adjust scroll amount based the width of the item and multiply by -1 or 1 for the left or right direction direction
        const scrollAmount = itemWidth * direction;

        itemRow.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        });
    }

    /**
     * Adds items to the carousel.
     * @param carousel The carousel to add the items to.
     * @param itemsToAdd The items to add.
     */
    public static async addItemsToCarousel(carousel: HTMLDivElement, itemsToAdd: IItem[]) {
        itemsToAdd.forEach((item: IItem) => {
            carousel.appendChild(FrontendUtil.createItemElementDiv(item));
        });
    }

    /**
     * Creates an Item element div using Item data.
     * @param item The item.
     * @returns The item element div.
     */
    public static createItemElementDiv(item: IItem): HTMLDivElement {

        // Create the div that will hold the item information
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";

        itemDiv.setAttribute("data-item-id", item.id);

        // Add item data to the divs
        const itemName = document.createElement("h3");
        itemName.textContent = item.name;

        const itemPrice = document.createElement("p");
        itemPrice.textContent = `Price: £${item.price}`;

        let itemCategories: HTMLParagraphElement = null;
        const categories = FrontendUtil.convertEncodedCategoriesToSet(item.encodedCategories);

        if (categories.size > 0){
            itemCategories = document.createElement("p");

            const categoriesArray = Array.from(categories);
            itemCategories.textContent = categoriesArray[0].toString();

            if (categoriesArray.length > 1) {
                itemCategories.textContent = categoriesArray[0].toString() + ", " + categoriesArray[1].toString();
            }

            itemCategories.classList.add("category-text");
        }

        const addToBasketImage = document.createElement("img");
        addToBasketImage.src = BasketIcon;
        addToBasketImage.alt = "Add to basket";
        addToBasketImage.className = "add-to-basket-img";

        addToBasketImage.style.cursor = "pointer";

        const itemRating = document.createElement("p");
            
        if (item.averageRating === 0 || item.averageRating === undefined || item.averageRating === null) {
            itemRating.textContent = "No Ratings Yet";
        }

        else {
            itemRating.textContent = `Rating: ${item.averageRating.toFixed(1)}`;
        }

        // Add item information to the itemDiv
        itemDiv.appendChild(itemName);
        itemDiv.appendChild(itemPrice);
        itemDiv.appendChild(itemRating);

        if (itemCategories !== null) {
            itemDiv.appendChild(itemCategories);
        }

        itemDiv.appendChild(addToBasketImage);

        itemDiv.addEventListener("click", () => {
            window.location.href = `/ItemDetail.html?itemId=${item.id}`;
        });

        return itemDiv;
    }

    /**
     * Shows the popup.
     * @param message The message to show.
     * @param isSuccess If the popup is a success or error.
     */
    public static showPopup(message: string, isSuccess: boolean): void {
        const popup = document.getElementById("popup");
        if (popup) {
            popup.textContent = message;
            popup.classList.remove("success", "error");
            popup.classList.add(isSuccess ? "success" : "error");
            popup.classList.add("visible");
        
            // Clear the popup after 4 seconds
            setTimeout(() => {
                popup.classList.remove("visible");
            }, 4000);
        }
    }
}