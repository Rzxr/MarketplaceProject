import "./ListItem.css";
import { ApiService } from "../../ApiService";
import { IItem } from "../../Interfaces/IItem";
import { FrontendUtil } from "../../FrontendUtils";

/**
 * A class that represents the List Item page.
 */
class ListItem {
    private itemNameInput = document.querySelector("#item-name-input") as HTMLInputElement;
    private itemPriceInput = document.querySelector("#item-price-input") as HTMLInputElement;
    private itemDescriptionInput = document.querySelector("#item-description-input") as HTMLInputElement;
    private itemQuantityInput = document.querySelector("#item-quantity-input") as HTMLInputElement;
    private itemImageInput = document.querySelector("#item-image-input") as HTMLInputElement;
    private listItemButton = document.querySelector(".list-item") as HTMLButtonElement;

    private currencySymbol = document.querySelector(".currency-symbol");
    private inputField = document.getElementById("item-price-input");
    private container = document.querySelector(".input-container");
    private itemGroupContainer = document.querySelector(".category-group") as HTMLDivElement;

    private messageContainer = document.querySelector(".message-container") as HTMLDivElement;

    private item: Partial<IItem>;

    /**
     * Constructs the List Item page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners.
     */
    private initialiseEventListeners() {
        this.listItemButton.addEventListener("click", this.handleListItemClick.bind(this));
        
        this.itemQuantityInput.addEventListener("input", () => {

            // If the input is not a number or is less than 1, set it to 1
            if (this.itemQuantityInput.value === "" || parseInt(this.itemQuantityInput.value, 10) < 1) {
                this.itemQuantityInput.value = "1";
            }
        });

        // this.adjustInputWidth();

        const hasContentLoaded = () => {
            console.log("List item loaded");

            // (window as Window).onresize = this.adjustInputWidth.bind(this);
        };
    
        // If the document has already loaded, call hasContentLoaded, otherwise wait for the document to load
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", hasContentLoaded);
        } else {
            hasContentLoaded();
        }

        // Add a listener to clear the image input
        document.getElementById("clear-image").addEventListener("click", () => {
            this.itemImageInput.value = "";
        });
    }

    /**
     * Handles the list item button click.
     */
    private async handleListItemClick() {
        const name = this.itemNameInput.value;
        const price = this.itemPriceInput.value;
        const description = this.itemDescriptionInput.value;
        const quantity = this.itemQuantityInput.value;
        const image = this.itemImageInput.files?.[0];

        FrontendUtil.clearAllValidationErrors();

        if (!name) {
            FrontendUtil.showValidationError(this.itemNameInput, "Please fill in the item name");
            return;
        }

        if (!price || !FrontendUtil.isPriceValid(price)) {
            FrontendUtil.showValidationError(this.itemPriceInput, "Please enter a valid item price");
            return;
        }

        if (!description) {
            FrontendUtil.showValidationError(this.itemDescriptionInput, "Please fill in the item description");
            return;
        }

        if (!FrontendUtil.isCheckboxChecked()) {
            FrontendUtil.showValidationError(document.querySelector(".category-group"), "Please select at least one category");
            return;
        }

        this.item = {
            name,
            price,
            description,
            quantityAvailable: parseInt(quantity) ?? 1,
            encodedCategories: FrontendUtil.checkboxesToOneHotEncoding(FrontendUtil.getCheckboxStatuses()).toString(),
            sellerId: await ApiService.getUserFromApi()?.then(user => user.id),
            image: image.name ?? null
        };
        
        if (await ApiService.createItem(this.item)) {
            FrontendUtil.showPopup("Item has been created successfully", true);
            this.clearInputs();
        }

        console.log(image);
    }

    /**
     * Clears the input fields.
     */
    private clearInputs() {
        this.itemNameInput.value = "";
        this.itemPriceInput.value = "";
        this.itemDescriptionInput.value = "";
        this.itemQuantityInput.value = "1";
        this.itemImageInput.value = "";

        // Clear the checkboxes
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"]");
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    /**
     * Dynamically adjusts the width of the input field to fill the remaining space accounting for the width of the currency symbol.
     * Note: this method is not used in the current implementation.
     */
    private adjustInputWidth() {

        // Note: this returns 0
        const symbolWidth = this.currencySymbol.clientWidth;
        const containerWidth = this.container.clientWidth;
           
        // Set the width of the input field to fill the remaining space
        this.inputField.style.width = `${containerWidth - 55}px`;
    }
}

/**
 * Runs the List Item page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    document.body.style.display = "block";

    const listItem = new ListItem();
});
