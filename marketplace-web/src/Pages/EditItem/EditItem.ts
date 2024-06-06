import "./EditItem.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IItem } from "../../Interfaces/IItem";

/**
 * A class representing the item Detail page.
 */
class EditItem {
    private item: IItem;
    private itemId: string;

    private itemNameInput = document.querySelector("#item-name-input") as HTMLInputElement;
    private itemPriceInput = document.querySelector("#item-price-input") as HTMLInputElement;
    private itemDescriptionInput = document.querySelector("#item-description-input") as HTMLInputElement;
    private itemQuantityInput = document.querySelector("#item-quantity-input") as HTMLInputElement;
    private itemImageInput = document.querySelector("#item-image-input") as HTMLInputElement;

    private updateItemButton = document.querySelector(".update-item") as HTMLButtonElement;
    private messageContainer = document.querySelector(".message-container") as HTMLDivElement;

    /**
     * Constructs the item Detail page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners for the item Detail page.
     */
    private initialiseEventListeners(): void {
        this.updateItemButton.addEventListener("click", this.handleUpdateItemClick.bind(this));

        this.itemQuantityInput.addEventListener("input", () => {

            // If the input is not a number or is less than 1, set it to 1
            if (this.itemQuantityInput.value === "" || parseInt(this.itemQuantityInput.value, 10) < 1) {
                this.itemQuantityInput.value = "1";
            }
        });
    }

    /**
     * Handles the list item button click.
     */
    private async handleUpdateItemClick() {
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

        const updateItem: Partial<IItem> = {
            id: this.itemId,
            name: name,
            price: price.toString(),
            description: description,
            quantityAvailable: parseInt(quantity) ?? 1,
            isPurchased: this.item.isPurchased,
            sellerId: this.item.sellerId,
            buyerId: this.item.buyerId,
            orderId: this.item.orderId,
            basketId: this.item.basketId,
            encodedCategories: FrontendUtil.checkboxesToOneHotEncoding(FrontendUtil.getCheckboxStatuses()).toString(),
            image: image.name ?? null
        };

        if (await ApiService.updateItemData(updateItem)) {
            FrontendUtil.showSuccessMessage("Item has been updated successfully", this.messageContainer);
            window.location.href = "./SellerStatistics.html";
            this.clearInputs();
        }
    }
    
    /**
     * Clears the input fields.
     */
    private clearInputs() {
        this.itemNameInput.value = "";
        this.itemPriceInput.value = "";
        this.itemDescriptionInput.value = "";
        this.itemQuantityInput.value = "1";
        // this.itemImageInput.value = "";
    
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    /**
     * Displays the details of the item on the page.
     */
    public async displayItemDetails(): Promise<void> {

        // Redirect if there is no search query
        if (!window.location.search) {
            window.location.href = "./Home.html";
        }

        // We need to get the item ID from the URL
        const url = new URLSearchParams(window.location.search);

        this.itemId = url.get("itemId");

        if (!this.itemId) {
            window.location.href = "./Home.html";
        }

        this.item = await ApiService.getItemWithId(this.itemId);

        this.itemNameInput.value = this.item.name;
        this.itemPriceInput.value = this.item.price.toString();
        this.itemDescriptionInput.value = this.item.description;
        this.itemQuantityInput.value = this.item.quantityAvailable.toString();

        // if (this.item.image) {
        //     const itemImage = document.createElement("img");
        //     itemImage.id = "item-image";
        //     itemImage.src = this.item.image;
        //     itemImage.alt = "Item Image";

        //     const imageContainer = document.querySelector(".image-group") as HTMLDivElement;
        //     imageContainer.appendChild(itemImage);
        // }

        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");

        // Set the checkboxes to the categories that the item is in
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = this.item.encodedCategories[i] === "1" ? true : false;
        }
    }
}

/**
 * Runs the EditItem page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const item = new EditItem();
    item.displayItemDetails().then(() => {
        document.body.style.display = "block";
    });
});