import "./BasketCheckout.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IItemInBasket } from "../../Interfaces/IItemInBasket";
import DeleteIcon from "../../../icons/DeleteIcon.png";

/**
 * A class representing the Basket Checkout page.
 */
class BasketCheckout {
    private checkoutButton = document.querySelector(".checkout-button");

    /**
     * Creates a new instance of the Basket Checkout page.
     */
    constructor() {
        this.handleRemoveItem = this.handleRemoveItem.bind(this);
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners for the Basket Checkout page.
     */
    private initialiseEventListeners(): void {
        window.addEventListener("DOMContentLoaded", () => {
            this.loadBasketItems();
        });

        this.checkoutButton.addEventListener("click", () => {
            this.checkout();
        });
    }

    /**
     * Loads the items in the user's basket.
     */
    public async loadBasketItems() {
        this.checkoutButton = document.querySelector(".checkout-button");
        const basketItems = await ApiService.getItemsInUserBasket();

        if (basketItems.length === 0 || !basketItems) {
            this.checkoutButton.classList.add("disabled");
        }

        await this.displayBasketItems(basketItems);
    }

    /**
     * Displays the items in the user's basket.
     * @param basketItems The items in the basket.
     */
    private displayBasketItems(basketItems: IItemInBasket[]) {
        const basketContainer = document.getElementById("basket-items-container");
        basketContainer.innerHTML = "";
    
        // Create a HTML element for each item in the basket
        basketItems.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "basket-item";

            itemElement.innerHTML = `
                <div class="basket-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: £${Number(item.price).toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <img src="${DeleteIcon}" class="remove-item" data-item-id="${item.id}" />
                </div>
            `;

            basketContainer.appendChild(itemElement);
        });
    
        this.updateTotal(basketItems);
        this.setupRemoveItemButtons();
    }
    
    /**
     * Updates the total price of the items in the basket.
     * @param items The items in the basket.
     */
    private updateTotal(items: IItemInBasket[]) {

        // Calculates the total price of the items in the basket using a reduce function
        const total = items.reduce((acc: number, item: IItemInBasket) => acc + (Number(item.price) * Number(item.quantity)), 0);
        const totalElement = document.querySelector(".basket-total p");
        totalElement.textContent = `Total: £${total.toFixed(2)}`;
    }

    /**
     * Checks out the User's basket.
     */
    private async checkout() {
        await ApiService.checkoutBasket();
            
        // Redirect to the OrderConfirmed page
        window.location.href = "/OrderConfirmed.html";
    }

    /**
     * Sets up the remove item buttons.
     */
    private setupRemoveItemButtons(): void {
        const removeItemButtons = document.querySelectorAll(".remove-item");

        removeItemButtons.forEach(button => {
            button.removeEventListener("click", this.handleRemoveItem);
            button.addEventListener("click", this.handleRemoveItem);

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
    private async handleRemoveItem(event: Event): Promise<void> {
        const button = event.target as HTMLButtonElement;
        const itemId = button.getAttribute("data-item-id");
    
        await ApiService.removeFromBasket(itemId);
        this.loadBasketItems();
    }
}

/**
 * Runs the Basket Checkout page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const basket = new BasketCheckout();
    basket.loadBasketItems().then(() => {
        document.body.style.display = "flex";
    });
});