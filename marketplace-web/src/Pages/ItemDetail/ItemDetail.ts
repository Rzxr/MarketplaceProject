import "./ItemDetail.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IItem } from "../../Interfaces/IItem";

/**
 * A class representing the Item Detail page.
 */
class ItemDetail {
    private itemId: string;
    private item: IItem;
    private isThisSellersItem: boolean;
    private debounceRatingTimer?: number;

    /**
     * Initialises the event listeners for the Item Detail page.
     */
    private initialiseEventListeners(): void {
        const addToBasketButton = document.querySelector("#add-to-basket") as HTMLButtonElement;

        if (this.isThisSellersItem) {
            return;
        }

        addToBasketButton.addEventListener("click", async () => {
            if (await ApiService.isItemInBasket(this.item.id)) {
                FrontendUtil.showPopup("Item already in basket", false);
                return;
            }

            FrontendUtil.showPopup("Item added to basket", true);

            await ApiService.addToBasket(this.item.id);
        });

        const buyNowButton = document.querySelector("#buy-now") as HTMLButtonElement;

        buyNowButton.addEventListener("click", async () => {
            await ApiService.checkoutItem(this.item.id);

            window.location.href = "/OrderConfirmed.html";
        });

        const tradeButton = document.querySelector("#trade") as HTMLButtonElement;

        tradeButton.addEventListener("click", async () => {
            const tradeContainer = document.querySelector(".trade-container") as HTMLDivElement;
            tradeContainer.style.display = "block";
            tradeContainer.classList.remove("hidden");

            tradeButton.style.display = "none";
            await this.trade();
        });

        const ratingInput = document.querySelector("#rating-input") as HTMLInputElement;

        ratingInput.addEventListener("keyup", (event) => {
            clearTimeout(this.debounceRatingTimer);

            if (event.key === "Enter") {
                this.handleRatingUpdate();
            }
            
            // Send rating update after 1 second
            else {
                this.debounceRatingTimer = window.setTimeout(() => {
                    this.handleRatingUpdate();
                }, 1000);

            }
        });
    }

    /**
     * Handles the rating update for the item.
     */
    private async handleRatingUpdate(): Promise<void> {
        const ratingInput = document.querySelector("#rating-input") as HTMLInputElement;

        if (ratingInput.value === "" || ratingInput.value === null) {
            FrontendUtil.showPopup("Please enter a rating", false);
            return;
        }

        const rating = Number(ratingInput.value);

        if (rating < 1 || rating > 5) {
            FrontendUtil.showPopup("Please enter a rating between 1 and 5", false);
            return;
        }

        FrontendUtil.showPopup("Rating submitted", true);
        await ApiService.addItemRating(this.item.id, rating);
        
        // TODO: This is not ideal but we need to refresh the page to show the updated rating
        await new Promise(resolve => setTimeout(resolve, 1000));

        window.location.reload();
    }

    /**
     * Handles the trade process.
     */
    private async trade(): Promise<void> {
        const tradeContainer = document.querySelector(".trade-container") as HTMLDivElement;
        let idToTrade: string;

        const tradeText = document.createElement("p");
        tradeText.textContent = "Select one of your item to trade:";

        const userItems = (await ApiService.getUserUnsoldItems());

        const userItemsContainer = document.createElement("div");
        userItemsContainer.className = "user-items-container";

        for (const item of Array.from(userItems)) {
            const itemContainer = document.createElement("div");
            itemContainer.setAttribute("id", item.id);
            itemContainer.className = "item-container";

            const itemName = document.createElement("p");
            itemName.textContent = item.name;

            const itemPrice = document.createElement("p");
            itemPrice.textContent = `Price: £${Number(item.price).toFixed(2)}`;

            itemContainer.appendChild(itemName);
            itemContainer.appendChild(itemPrice);

            userItemsContainer.appendChild(itemContainer);

            itemContainer.addEventListener("click", () => {
                idToTrade = item.id;
                itemContainer.style.backgroundColor = "lightblue";

                for (const item of Array.from(userItems)) {
                    if (item.id !== idToTrade) {
                        const otherItem = document.getElementById(item.id);
                        otherItem.style.backgroundColor = "white";
                    }
                }
            });
        }

        tradeContainer.appendChild(tradeText);

        tradeContainer.appendChild(userItemsContainer);

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container";
    
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirm Trade";
        confirmButton.classList.add("confirm-trade");

        confirmButton.addEventListener("click", async () => {
            if (!idToTrade) {
                FrontendUtil.showPopup("Please select an item to trade", false);

                return;
            }

            await ApiService.tradeItems(this.item.id, idToTrade);
            FrontendUtil.showPopup("Trade successful", true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = "/Home.html";
            tradeContainer.innerHTML = "";
            this.displayItemDetails();
        });
    
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";

        cancelButton.addEventListener("click", () => {
            tradeContainer.classList.add("hidden");
            (document.querySelector("#trade") as HTMLDivElement).style.display = "block";
            tradeContainer.innerHTML = "";
        });

        cancelButton.classList.add("cancel-trade");

        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        tradeContainer.appendChild(buttonsContainer);
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
        this.isThisSellersItem = this.item.sellerId === (await ApiService.getUserFromApi()).id;

        const itemDetailContainer = document.querySelector(".item-detail-container") as HTMLDivElement;

        const itemName = document.createElement("h1");
        itemName.id = "item-name";
        itemName.textContent = this.item.name;

        const itemImage = document.createElement("img");
        itemImage.id = "item-image";

        // Set the image if it exists, otherwise set the default dimensions with grey background
        if (this.item.image) {
            console.log(this.item.image);
            itemImage.src = this.item.image;
            itemImage.alt = "Item Image";
            itemImage.style.width = "100%";
            itemImage.style.height = "100%";
        } else {
            itemImage.alt = "No Item Image Available";
            itemImage.style.width = "100%";
            itemImage.style.height = "400px";
        }

        const itemDescription = document.createElement("p");
        itemDescription.id = "item-description";
        itemDescription.textContent = this.item.description;

        const currentRating = document.createElement("p");
        currentRating.id = "current-rating";

        if (this.item.averageRating === 0 || this.item.averageRating === undefined || this.item.numOfRatings === 0 || this.item.numOfRatings === undefined) {
            currentRating.textContent = "This Item has not been rated yet";
        } else {
            // currentRating.textContent = `Current Rating: ${Number(this.item.averageRating).toFixed(1)}`;
        }

        const ratingContainer = document.createElement("div");
        ratingContainer.className = "rating-container";

        const label = document.createElement("label");
        label.textContent = "Rate this item between 1 and 5: ";
        
        const ratingInput = document.createElement("input");
        ratingInput.type = "number";
        ratingInput.min = "1";
        ratingInput.max = "5";
        ratingInput.step = "1";
        ratingInput.value = "";
        ratingInput.id = "rating-input";

        const itemPrice = document.createElement("p");
        itemPrice.id = "item-price";
        itemPrice.textContent = `Price: £${Number(this.item.price).toFixed(2)}`;

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container";

        const addToBasketButton = document.createElement("button");
        addToBasketButton.id = "add-to-basket";
        addToBasketButton.textContent = "Add to Basket";

        const buyNowButton = document.createElement("button");
        buyNowButton.id = "buy-now";
        buyNowButton.textContent = "Buy Now";

        const tradeButton = document.createElement("button");
        tradeButton.id = "trade";
        tradeButton.textContent = "Trade";

        const tradeContainer = document.createElement("div");
        tradeContainer.className = "trade-container";

        tradeContainer.style.display = "none";

        // Users cannot buy their own items
        if (this.isThisSellersItem) {
            addToBasketButton.classList.add("disabled");
            buyNowButton.classList.add("disabled");
            ratingInput.classList.add("disabled");
            tradeButton.classList.add("disabled");
            ratingInput.disabled = true;
        }

        ratingContainer.appendChild(label);
        ratingContainer.appendChild(ratingInput);

        buttonsContainer.appendChild(addToBasketButton);
        buttonsContainer.appendChild(tradeButton);
        buttonsContainer.appendChild(buyNowButton);

        itemDetailContainer.appendChild(itemName);
        itemDetailContainer.appendChild(itemImage);
        itemDetailContainer.appendChild(itemDescription);
        itemDetailContainer.appendChild(currentRating);
        itemDetailContainer.appendChild(ratingContainer);
        itemDetailContainer.appendChild(itemPrice);
        itemDetailContainer.appendChild(tradeContainer);
        itemDetailContainer.appendChild(buttonsContainer);

        this.initialiseEventListeners();
    }
}

/**
 * Runs the Item Detail page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const item = new ItemDetail();
    item.displayItemDetails().then(() => {
        document.body.style.display = "block";
    });
});