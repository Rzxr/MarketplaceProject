import "./OrderConfirmed.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IOrder } from "../../Interfaces/IOrder";

/**
 * A class representing the Order Confirmed page.
 */
class OrderConfirmed {

    /**
     * Creates a new instance of the Order Confirmed page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners for the Order Confirmed page.
     */
    private initialiseEventListeners(): void {
        window.addEventListener("DOMContentLoaded", () => {
            this.loadOrderDetails();
        });
    }

    /**
     * Displays the order details on the page.
     */
    private displayOrderItems(order: IOrder) {
        const container = document.getElementById("order-items-container");
        container.innerHTML = "";
    
        // Create an HTML element for each item in the order
        order.items.forEach((item) => {
            const itemElement = document.createElement("div");
            itemElement.className = "order-item";
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Price: £${Number(item.price).toFixed(2)}</p>
            `;
            container.appendChild(itemElement);
        });
        
        const orderIdElement = document.getElementById("order-id");

        // Check for not null and display
        if (orderIdElement) {
            orderIdElement.textContent = order.items[0].orderId;
        }

        this.displayTotal(order.totalAmount);
    }

    /**
     * Updates the total amount displayed on the page.
     * @param total The total amount.
     */
    private displayTotal(total: number) {
        const totalElement = document.querySelector(".order-total p");

        if (totalElement) {
            totalElement.textContent = `Total: £${total.toFixed(2)}`;
        }
    }

    /**
     * Loads the order details.
     */
    public async loadOrderDetails() {
        this.displayOrderItems(await ApiService.getOrderDetails());
    }
}

/**
 * Run the Order Confirmed page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    const orderConfirmed = new OrderConfirmed();
    orderConfirmed.loadOrderDetails().then(() => {
        document.body.style.display = "flex";
    });
});