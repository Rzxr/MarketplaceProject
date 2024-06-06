import "./Home.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IBasket } from "../../Interfaces/IBasket";
import { IItem } from "../../Interfaces/IItem";

/**
 * A class representing the Home page.
 */
class Home {
    private prevButtons = document.querySelectorAll(".carousel-arrow.prev");
    private nextButtons = document.querySelectorAll(".carousel-arrow.next");
    private isButtonSetup = false;
    
    private searchInput = document.querySelector(".search-item-input") as HTMLInputElement;
    private debounceSearchTimer?: number;
    
    private userBasket: IBasket;

    /**
     * Creates a new instance of the Home page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners for the Home page.
     */
    private initialiseEventListeners(): void {
        this.prevButtons.forEach(button => {
            button.addEventListener("click", (event) => FrontendUtil.handleCarouselClick(event, -1, ".item-row", ));
        });

        this.nextButtons.forEach(button => {
            button.addEventListener("click", (event) => FrontendUtil.handleCarouselClick(event, 1, ".item-row"));
        });

        this.searchInput.addEventListener("keyup", (event) => {
            clearTimeout(this.debounceSearchTimer);

            // If enter is is pressed, handle search immediately
            if (event.key === "Enter") {
                this.handleSearch();
            }
            
            // Otherwise, wait for 1 second of inactivity
            // We use the debounce pattern to prevent multiple calls
            else {
                this.debounceSearchTimer = window.setTimeout(() => {
                    this.handleSearch();
                }, 1000);
            }
        });

        // Add border to the search bar when we're focussed
        this.searchInput.addEventListener("focus", () => {
            this.searchInput.placeholder = "";
            this.searchInput.style.border = "2px black solid";
        });

        // Remove border from the search bar when we're not focussed
        this.searchInput.addEventListener("blur", () => {
            this.searchInput.placeholder = "Search for an item...";
            this.searchInput.style.border = "none";
        });


        ApiService.getBasketFromApi().then(basket => { this.userBasket = basket; });
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
     * Inserts the items into a specific carousel.
     * @param carouselIdentifier The unique identifier for the carousel container.
     * @param itemsToInsert The items to insert into the carousel.
     */
    private insertItemsIntoCarousel(carouselIdentifier: string, itemsToInsert: IItem[]): void {
        const carousel = document.querySelector(carouselIdentifier);
        if (carousel) {
            carousel.innerHTML = "";
            FrontendUtil.addItemsToCarousel(carousel as HTMLDivElement, itemsToInsert);
        }
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
     * Updates the recommended items heading.
     * @param itemId The item id.
     */
    private async updateRecommendedItemsHeading(): Promise<void> {

        // Don't display if there are no orders
        if (!await ApiService.getOrderDetails()) {
            return;
        }

        const purchasedCategories = FrontendUtil.convertEncodedCategoriesToSet(await ApiService.getUserPurchasedCategories());
        const firstCategory = Array.from(purchasedCategories.keys())[0];

        const recommendedItemsHeading = document.querySelector(".recommended-items-heading");

        if (recommendedItemsHeading) {
            recommendedItemsHeading.textContent = `Recommended Items (because you purchased Items from ${FrontendUtil.formatCategories(firstCategory)})`;
        }
    }

    /**
     * Inserts the items into the carousels.
     */
    public async insertItemsIntoCarousels(): Promise<void> {
        const newItems = await ApiService.getNewestAndAvailableItems();
        const recommendedItems = await ApiService.getRecommendedItems();
        const highestRatedItems = await ApiService.getHighestRatedItems();

        // Gets new items that are not purchased but are from the current user
        this.insertItemsIntoCarousel(".new-items .item-row", newItems);

        // Gets recommended items that are not purchased and not from current user
        this.insertItemsIntoCarousel(".recommended-items .item-row", recommendedItems);

        // Gets items the highest rated items
        this.insertItemsIntoCarousel(".highest-rated-items .item-row", highestRatedItems);

        this.setupAddToBasketImgButtons();
        this.updateRecommendedItemsHeading();
    }
}

/**
 * Runs the Home page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const home = new Home();
    home.insertItemsIntoCarousels().then(() => {
        document.body.style.display = "block";
    });
});