import "./Account.css";
import { ApiService } from "../../ApiService";
import { IUser } from "../../Interfaces/IUser";
import { FrontendUtil } from "../../FrontendUtils";

/**
 * A class that represents the Account page.
 */
class Account {
    private deleteButton: HTMLButtonElement;
    
    private usernameElement = document.querySelector(".user-email") as HTMLParagraphElement;
    private addressElement = document.querySelector(".address") as HTMLParagraphElement;
    
    private passwordElement = document.querySelector(".password") as HTMLParagraphElement;
    private newPasswordElement = document.querySelector(".new-password") as HTMLParagraphElement;
    private confirmPasswordElement = document.querySelector(".confirm-password") as HTMLParagraphElement;

    private usernameInput = document.querySelector("#email-input") as HTMLInputElement;
    private addressInput = document.querySelector("#address-input") as HTMLInputElement;

    private passwordInput = document.querySelector("#password-input") as HTMLInputElement;
    private newPasswordInput = document.querySelector("#new-password-input") as HTMLInputElement;
    private confirmPasswordInput = document.querySelector("#confirm-password-input") as HTMLInputElement;

    private passwordConfirmed = false;

    private user: IUser;

    /**
     * Constructs the Account page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Gets the user from the API and displays the user's data.
     */
    public async getUserAndDisplayData(): Promise<void> {
        await this.getUser();
        await this.displayUserData();
    }

    /**
     * Gets the user from the API.
     */
    private async getUser(): Promise<void> {
        this.user = await ApiService.getUserFromApi();
    }
    
    /**
     * Displays the user's data.
     */
    private async displayUserData(): Promise<void> {
        this.usernameElement.textContent = this.user.email;
        this.addressElement.textContent = this.user.address;

        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");

        // Check the checkboxes using the user's interested categories
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = this.user.encodedInterestedCategories[i] === "1" ? true : false;
        }

        for (const checkbox of Array.from(checkboxes)) {
            checkbox.disabled = true;
        }

        await this.displayPreviousOrders();
    }

    /**
     * Initialises the event listeners.
     */
    private initialiseEventListeners(): void {
        const hasContentLoaded = () => {
            document.querySelectorAll(".edit-button").forEach(button => {
                button.addEventListener("click", this.handleEditButtonClick.bind(this));
            });

            (document.querySelector(".delete-account") as HTMLButtonElement).addEventListener("click", this.handleDeleteButtonClick.bind(this));

            (document.querySelector(".logout") as HTMLButtonElement).addEventListener("click", () => {

                // Logs out and redirects back to the login page
                ApiService.logoutSession().then(isLoggedOut => {
                    if (isLoggedOut) {
                        FrontendUtil.redirectToLogin();
                    }
                });
            });
        };

        const sellerStatsButton = document.querySelector(".seller-statistics") as HTMLButtonElement;
        sellerStatsButton.addEventListener("click", this.handleViewSellerStatistics.bind(this));
    
        // If the document has already loaded, call hasContentLoaded, otherwise wait for the document to load
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", hasContentLoaded);
        } else {
            hasContentLoaded();
        }
    }

    /**
     * Handles the edit button click event.
     * @param event The button event.
     */
    private handleEditButtonClick(event: Event): void {
        const button = event.target as HTMLButtonElement;

        switch (button.getAttribute("edit-type")) {
            case "email":
                this.toggleEdit(this.usernameInput, this.usernameElement, "email");
                break;
            case "password":
                this.toggleEditPassword(this.passwordInput, this.passwordElement, this.newPasswordInput, this.newPasswordElement, this.confirmPasswordInput, this.confirmPasswordElement);
                break;
            case "address":
                this.toggleEdit(this.addressInput, this.addressElement, "address");
                break;
            case "category":
                this.toggleEditCategory();
                break;
        }
    }

    /**
     * Handles the editing of the user's email and address.
     * @param inputElement The new email or address input element.
     * @param textElement The new email or address text.
     * @param type Email or address.
     */
    private async toggleEdit(inputElement: HTMLInputElement, textElement: HTMLParagraphElement, type: string): Promise<void> {
        let isEditorDisplayed = false;

        isEditorDisplayed = textElement.style.display === "none";

        let isValid = false;
        let errorMessage = "";

        // Switch to edit mode
        if (!isEditorDisplayed) {
            inputElement.style.display = "";
            textElement.style.display = "none";

            inputElement.value = textElement.textContent;

            inputElement.focus();
            return;
        }

        textElement.textContent = inputElement.value;
        textElement.style.display = "";
        inputElement.style.display = "none";

        switch (type) {
            case "email":
                if (inputElement.value === this.user.email) {
                    return;
                }

                isValid = FrontendUtil.validateEmail(inputElement.value, this.user.email);
                errorMessage = "Please enter a valid email address.";
                break;

            case "address":
                if (inputElement.value === this.user.address) {
                    return;
                }

                isValid = FrontendUtil.validateAddress(inputElement.value, this.user.address);
                errorMessage = "Please enter a valid address.";
                break;
        }

        if (!isValid) {
            FrontendUtil.showValidationError(inputElement, errorMessage);
            return;
        }

        FrontendUtil.clearValidationError(inputElement);

        const newUserData = this.user;

        switch (type) {
            case "email":
                newUserData.email = inputElement.value;
                break;
            case "address":
                newUserData.address = inputElement.value;
                break;
        }

        // Send data to server
        if (!await ApiService.updateUserData(newUserData)) {
            console.error("Failed to update user data");
            return;
        }

        FrontendUtil.showPopup("User data updated successfully", true);

        this.user.email = newUserData.email;
        this.user.address = newUserData.address;
    }

    /**
     * Handles editing the password.
     * @param inputElement The old password input element.
     * @param textElement The old password text.
     * @param newInputElement The new password input element.
     * @param newTextElement The new password text.
     * @param confirmInputElement The confirm password input element.
     * @param confirmTextElement The confirm password text.
     */
    private toggleEditPassword(inputElement: HTMLInputElement, textElement: HTMLParagraphElement, newInputElement: HTMLInputElement, newTextElement: HTMLParagraphElement, confirmInputElement: HTMLInputElement, confirmTextElement: HTMLParagraphElement): void {
        const isEditorDisplayed = false;

        let isValid = false;
        let errorMessage = "";

        FrontendUtil.clearValidationError(inputElement);
        FrontendUtil.clearValidationError(confirmInputElement);

        // If the editor is displayed, validate the input and save the data
        if (!isEditorDisplayed && (inputElement.value !== "" && newInputElement.value !== "" && confirmInputElement.value !== "")) {

            if (inputElement.value !== this.user.password) {
                errorMessage = "Please enter your current password.";
                FrontendUtil.showValidationError(inputElement, errorMessage);
                return;
            }

            isValid = FrontendUtil.validatePassword(newInputElement.value, confirmInputElement.value);
            errorMessage = "Password must be at least 8 characters and match.";

            if (!isValid) {
                FrontendUtil.showValidationError(confirmInputElement, errorMessage);
                return;
            }

            FrontendUtil.clearValidationError(inputElement);

            const newUserData = this.user;
            newUserData.password = confirmInputElement.value;

            ApiService.updateUserData(newUserData);

            FrontendUtil.showPopup("User data updated successfully", true);

            this.user.password = newUserData.password;

            inputElement.value = "";
            textElement.style.display = "none";
            inputElement.style.display = "none";
        
            newInputElement.value = "";
            newTextElement.textContent = "";
            newTextElement.style.display = "none";
            newInputElement.style.display = "none";
        
            confirmInputElement.value = "";
            confirmTextElement.textContent = "";
            confirmTextElement.style.display = "none";
            confirmInputElement.style.display = "none";

            this.passwordConfirmed = false;
            return;
        }

        // If the inputs are empty, then hide the inputs
        if (this.passwordConfirmed && (inputElement.value === "" && newInputElement.value === "" && confirmInputElement.value === "")) {

            textElement.style.display = "none";
            inputElement.style.display = "none";
    
            newTextElement.style.display = "none";
            newInputElement.style.display = "none";
    
            confirmTextElement.style.display = "none";
            confirmInputElement.style.display = "none";

            this.passwordConfirmed = false;
            return;
        }

        inputElement.style.display = "";
        textElement.style.display = "none";

        newInputElement.style.display = "";
        newTextElement.style.display = "none";

        confirmInputElement.style.display = "";
        confirmTextElement.style.display = "none";

        inputElement.value = inputElement.value !== null ? inputElement.value : textElement.textContent;
        this.passwordConfirmed = !this.passwordConfirmed;
    }

    /**
     * Handles editing the user's interested categories.
     */
    private toggleEditCategory(): void {
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"].category");

        if (checkboxes[0].disabled) {
            checkboxes.forEach(checkbox => { checkbox.disabled = false; });
            const categoryGroupContainer = document.querySelector(".checkbox-group") as HTMLDivElement;
            categoryGroupContainer.focus();
            return;
        }

        const newUserData = this.user;

        FrontendUtil.clearAllValidationErrors();

        if (!FrontendUtil.isCheckboxChecked()) {
            FrontendUtil.showValidationError(document.querySelector(".checkbox-group"), "Please select at least one category");
            return;
        }

        const checkboxesArray = Array.from(checkboxes);

        newUserData.encodedInterestedCategories = FrontendUtil.checkboxesToOneHotEncoding(FrontendUtil.getCheckboxStatuses()).toString();

        ApiService.updateUserData(newUserData);

        FrontendUtil.showPopup("User data updated successfully", true);

        this.user = newUserData;

        for (const checkbox of checkboxesArray) {
            checkbox.disabled = true;
        }

    }

    /**
     * Handles the delete button click event.
     */
    private async handleDeleteButtonClick(): Promise<void> {

        if (confirm("Are you sure you want to delete your account? This action is destructive.")) {
            if (await this.deleteAccount()) {
                window.location.href = "/Login.html";
            }
        }
    }

    /**
     * Handles the view seller statistics button click event.
     */
    private async handleViewSellerStatistics() {
        window.location.href = "/SellerStatistics.html";
    }

    /**
     * Deletes the account.
     * @returns True if the account was deleted, otherwise False.
     */
    private async deleteAccount(): Promise<boolean> {
        return await ApiService.deleteUserData();
    }

    /**
     * Displays the user's previous orders.
     */
    private async displayPreviousOrders(): Promise<void> {
        const orders = await ApiService.getUserOrders();

        const pastOrdersContainer = document.querySelector(".past-orders-list");
        pastOrdersContainer.innerHTML = "";

        // Loop through all the orders, and create the html elements to display them
        orders.forEach(order => {
            const orderDiv = document.createElement("div");
            orderDiv.className = "past-order";

            orderDiv.innerHTML = `
                <h3>Order #${order.id}</h3>
                <p>Date Ordered: ${new Date(order.purchaseDate).toLocaleDateString()} at ${new Date(order.purchaseDate).toLocaleTimeString()} </p>
                <p>Total: £${order.totalAmount}</p>
            `;

            order.items.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "past-order-item";

                itemDiv.innerHTML = `
                    <p>${item.name}</p>
                    <p>£${item.price}</p>
                `;

                orderDiv.appendChild(itemDiv);
            });

            pastOrdersContainer.appendChild(orderDiv);
        });
    }
}

/**
 * Runs the Account page.
 */
async function runAccountPage() {
    const accountPage = new Account();
    await accountPage.getUserAndDisplayData();
}

/**
 * Checks if the user is logged in, and runs the Account page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (!isLoggedIn) {
        FrontendUtil.redirectToLogin();
        return;
    }

    document.body.style.display = "block";
    runAccountPage();
});
