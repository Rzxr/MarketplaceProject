import "./SellerStatistics.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import DeleteIcon from "../../../icons/DeleteIcon.png";
import { IItem } from "../../Interfaces/IItem";

/**
 * A class that represents the Seller Statistics page.
 */
class SellerStatistics {

    /**
     * Constructs the Seller Statistics page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners.
     */
    private initialiseEventListeners(): void {
    }

    /**
     * Displays the unsold items.
     * @param items The items.
     */
    private async displayUnsoldItems(items: IItem[]): Promise<void> {
        const unsoldItemsContainer = document.querySelector(".items-listed");
        unsoldItemsContainer.innerHTML = "";

        if (items === null || items.length === 0) {
            unsoldItemsContainer.innerHTML = "<p>You do not have any items for sale</p>";
            return;
        }

        const itemsText = document.createElement("h2");
        itemsText.textContent = "Currently Listed Items";

        unsoldItemsContainer.appendChild(itemsText);
    
        // Create an HTML element for each item
        items.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "item-unsold-element";

            let ratingText = "";

            if (item.averageRating === null || item.averageRating === 0 || item.averageRating === undefined) {
                ratingText = "No ratings yet";
            }
            else {
                ratingText = `Average Rating: ${item.averageRating.toFixed(1)}`;
            }

            itemElement.innerHTML = `
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: £${Number(item.price).toFixed(2)}</p>
                    <p>Date Listed: ${new Date(item.dateAdded).toLocaleDateString()} at ${new Date(item.dateAdded).toLocaleTimeString()} </p>
                    <p>${ratingText}</p>
                    <img src="${DeleteIcon}" class="remove-item" data-item-id="${item.id}" />
                </div>
            `;

            // Redirect to edit when the item is clicked on
            itemElement.addEventListener("click", () => {
                window.location.href = `/EditItem.html?itemId=${item.id}`;
            });

            unsoldItemsContainer.appendChild(itemElement);
        });
    
        this.setupRemoveItemButtons();
    }

    /**
     * Displays the sold items.
     * @param items The items.
     */
    private async displaySoldItems(items: IItem[]): Promise<void> {
        const soldItemsContainer = document.querySelector(".sold-items");
        soldItemsContainer.innerHTML = "";

        if (items === null || items.length === 0) {
            soldItemsContainer.innerHTML = "<p>You have not sold any Items</p>";
            return;
        }

        const itemsText = document.createElement("h2");
        itemsText.textContent = "Your Sold Items";

        soldItemsContainer.appendChild(itemsText);
    
        items.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "item-sold-element";

            itemElement.innerHTML = `
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: £${Number(item.price).toFixed(2)}</p>
                </div>
            `;

            soldItemsContainer.appendChild(itemElement);
        });

        const total = items.reduce((acc, item) => acc + parseFloat(item.price), 0);

        const totalContainer = document.createElement("div");
        totalContainer.innerHTML = `Total Sales: £${total.toFixed(2)}`;
        totalContainer.className = "total-sales";
        soldItemsContainer.appendChild(totalContainer);
    }

    /**
     * Sets up the remove item buttons.
     */
    private setupRemoveItemButtons(): void {
        const removeItemButtons = document.querySelectorAll(".remove-item");
    
        removeItemButtons.forEach(button => {
            button.removeEventListener("click", this.handleItemDelete);
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                this.handleItemDelete(event);
            });
     
            button.addEventListener("mouseover", function() {
                console.log("hover");
                this.classList.add("hover");
            });
            
            button.addEventListener("mouseout", function() {
                this.classList.remove("hover");
            });
        });
    }

    /**
     * Handles the remove item button click event.
     * @param event The event.
     */
    private async handleItemDelete(event: Event): Promise<void> {
        const button = event.target as HTMLButtonElement;
        const itemId = button.getAttribute("data-item-id");
        
        await ApiService.deleteItem(itemId);
        this.loadStatistics();
    }

    /**
     * Loads the statistics.
     */
    public async loadStatistics(): Promise<void> {
        const soldItems = await ApiService.getUserSoldItems();
        const unsoldItems = await ApiService.getUserUnsoldItems();
        
        await this.displayUnsoldItems(unsoldItems);
        await this.displaySoldItems(soldItems);
    }
}

/**
 * Runs the Seller Statistics page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const sellerStats = new SellerStatistics();
    sellerStats.loadStatistics().then(() => {
        document.body.style.display = "flex";
    });
});
