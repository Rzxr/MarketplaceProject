import "./AllItems.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IItem } from "../../Interfaces/IItem";
import { IBasket } from "../../Interfaces/IBasket";
import { IItemFilter } from "../../Interfaces/IItemFilter";

/**
 * A class representing the All Items page.
 */
class AllItems {
    private itemsInAlphabeticalOrder: IItem[] = [];
    private isButtonSetup = false;

    private searchInput = document.querySelector(".search-item-input") as HTMLInputElement;
    private debounceSearchTimer?: number;

    private userBasket: IBasket;

    private filterButton = document.querySelector(".filter-button") as HTMLButtonElement;
    private clearButton = document.querySelector(".clear-button") as HTMLButtonElement;

    private priceLowestCheckbox: HTMLInputElement;
    private priceHighestCheckbox: HTMLInputElement;
    private ratingLowestCheckbox: HTMLInputElement;
    private ratingHighestCheckbox: HTMLInputElement;

    /**
     * Creates a new instance of the All Items page.
     */
    constructor() {
        this.initialiseEventListeners();
    }
    
    /**
     * Initialises the event listeners for the All Items page.
     */
    private initialiseEventListeners(): void {
   
        this.searchInput.addEventListener("keyup", (event) => {
            clearTimeout(this.debounceSearchTimer);
    
            // If enter is is pressed, handle search immediately
            if (event.key === "Enter") {
                this.handleSearch();
            }
                
            // Otherwise, wait for 1 second of inactivity
            // Use the debounce pattern to prevent multiple calls
            else {
                this.debounceSearchTimer = window.setTimeout(() => {
                    this.handleSearch();
                }, 1000);
            }
        });

        this.filterButton.addEventListener("click", async () => {
            this.handleFilter();
        });

        this.clearButton.addEventListener("click", async () => {
            this.clearFilter();
        });
    
        // Add border when we're focussed
        this.searchInput.addEventListener("focus", () => {
            this.searchInput.placeholder = "";
            this.searchInput.style.border = "2px black solid";
        });
    
        ApiService.getBasketFromApi().then(basket => { this.userBasket = basket; });
    }

    /**
     * Handles the search input.
     */
    private async handleSearch(): Promise<void> {
        const searchValue = this.searchInput.value.toLowerCase();
    
        if (searchValue === "" || searchValue === null || searchValue === " ") {
            FrontendUtil.showPopup("Please enter a search term", false);
            return;
        }
    
        const foundItem = await ApiService.getItemByName(searchValue);
    
        if (!foundItem || foundItem === null) {
            FrontendUtil.showPopup("Item not found", false);
            return;
        }
    
        this.searchInput.value = "";
    
        window.location.href = `/ItemDetail.html?itemId=${foundItem.id}`;
    }

    /**
     * Handle item filtering.
     */
    private async handleFilter(): Promise<void> {
        const categoriesToFilter = FrontendUtil.checkboxesToOneHotEncoding(FrontendUtil.getCheckboxStatuses()).toString();

        const itemFilter: IItemFilter = {
            categories: undefined,
            price: undefined,
            rating: undefined
        };

        if (categoriesToFilter === "" || categoriesToFilter === "0,0,0,0,0,0,0,0,0,0,0,0") {
            FrontendUtil.showPopup("Please select at least one category to filter", false);
            return;
        }

        if (this.priceLowestCheckbox.checked) {
            itemFilter.price = "lowest";
        }

        if (this.priceHighestCheckbox.checked) {
            itemFilter.price = "highest";
        }

        if (this.ratingLowestCheckbox.checked) {
            itemFilter.rating = "lowest";
        }

        if (this.ratingHighestCheckbox.checked) {
            itemFilter.rating = "highest";
        }

        itemFilter.categories = categoriesToFilter;

        const filteredItems = await ApiService.getFilteredItems(itemFilter);

        if (filteredItems === null || filteredItems.length === 0) {
            FrontendUtil.showPopup("No items found with the selected filter", false);
            return;
        }

        FrontendUtil.showPopup("Items have been filtered", true);

        this.displayItems(filteredItems);
    }

    /**
     * Clears the filter.
     */
    private async clearFilter(): Promise<void> {
        FrontendUtil.clearCheckboxes();

        this.priceLowestCheckbox.checked = false;
        this.priceHighestCheckbox.checked = false;
        this.ratingLowestCheckbox.checked = false;
        this.ratingHighestCheckbox.checked = false;

        this.displayItems(this.itemsInAlphabeticalOrder);
    }

    /**
     * Displays the items.
     * @param The items to display.
     */
    private displayItems(items: IItem[]): void {
        const viewItemsContainer = document.querySelector(".all-items-container") as HTMLDivElement;
        viewItemsContainer.innerHTML = "";

        if (items === null || items.length === 0) {
            return;
        }

        let itemElement;

        items.forEach(item => {
            itemElement = FrontendUtil.createItemElementDiv(item);

            viewItemsContainer.appendChild(itemElement);
        });

        this.setupAddToBasketImgButtons();
    }

    /**
     * Sets up the add to basket buttons.
     */
    private async setupAddToBasketImgButtons(): Promise<void> {
        if (this.isButtonSetup) {
            return;
        }
        
        const addToBasketButtons = document.querySelectorAll(".add-to-basket-img");
        
        const addToBasketButtonsArray = Array.from(addToBasketButtons) as HTMLButtonElement[];
    
        for (const button of addToBasketButtonsArray) {
            button.addEventListener("click", async (event) => {
                event.stopPropagation();
                const itemElement = (event.target as HTMLButtonElement).closest(".item");
                
                // Set the ID of the item to get the correct item from the API when it's clicked
                const itemId = itemElement?.getAttribute("data-item-id");
    
                const isItemInBasket = await ApiService.isItemInBasket(itemId);
    
                if (isItemInBasket) {
                    FrontendUtil.showPopup("Item is already in the basket", false);
                }
    
                if ((await ApiService.getItemWithId(itemId)).isPurchased) {
                    FrontendUtil.showPopup("Item has already been purchased", false);
                }
                    
                else {
                    const item = await ApiService.getItemWithId(itemId);
    
                    if (item.sellerId === (await ApiService.getUserFromApi()).id) {
                        FrontendUtil.showPopup("You cannot add your own item to the basket", false);
                        return;
                    }
    
                    await ApiService.addToBasket(itemId);
                    FrontendUtil.showPopup("Added to basket", true);
                        
                }
            });
    
            // Override hover with event listeners
            button.addEventListener("mouseover", function() {
                console.log("hover");
                this.classList.add("hover");
            });
                
            button.addEventListener("mouseout", function() {
                this.classList.remove("hover");
            });
        }
            
        this.isButtonSetup = true;
    }

    /**
     * Loads all the items.
     */
    public async loadAllItems(): Promise<void> {
        this.itemsInAlphabeticalOrder = await ApiService.getItemsInAlphabeticalOrder();

        this.priceLowestCheckbox = document.querySelector("#cheapest-price") as HTMLInputElement;
        this.priceHighestCheckbox = document.querySelector("#highest-price") as HTMLInputElement;
        this.ratingLowestCheckbox = document.querySelector("#lowest-rated") as HTMLInputElement;
        this.ratingHighestCheckbox = document.querySelector("#highest-rated") as HTMLInputElement;

        // Manually handle button clicks as it's not native

        this.priceLowestCheckbox.addEventListener("click", () => {
            this.priceHighestCheckbox.checked = false;
        });

        this.priceHighestCheckbox.addEventListener("click", () => {
            this.priceLowestCheckbox.checked = false;
        });

        this.ratingLowestCheckbox.addEventListener("click", () => {
            this.ratingHighestCheckbox.checked = false;
        });

        this.ratingHighestCheckbox.addEventListener("click", () => {
            this.ratingLowestCheckbox.checked = false;
        });


        this.displayItems(this.itemsInAlphabeticalOrder);
    }
  
}

/**
 * Run the All Items page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const allItems = new AllItems();
    allItems.loadAllItems().then(() => {
        document.body.style.display = "flex";
    });
});