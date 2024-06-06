import "./Signup.css";
import { ApiService } from "../../ApiService";
import { FrontendUtil } from "../../FrontendUtils";
import { IUser } from "../../Interfaces/IUser";

/**
 * A class that represents the Signup / Register account page.
 */
class Signup {
    private emailInput = document.querySelector("#email-input") as HTMLInputElement;
    private passwordInput = document.querySelector("#password-input") as HTMLInputElement;
    private confirmPasswordInput = document.querySelector("#confirm-password-input") as HTMLInputElement;
    private addressInput = document.querySelector("#address-input") as HTMLInputElement;

    private signupButton = document.querySelector(".create-account") as HTMLButtonElement;
    private signupGroupContainer = document.querySelector(".signup-group") as HTMLDivElement;

    private user: Partial<IUser>;

    /**
     * Constructs the Account page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners.
     */
    private initialiseEventListeners() {
        this.signupButton.addEventListener("click", this.handleSignupButtonClick.bind(this));
    }

    /**
     * Handles the Signup button click.
     * @param event The button event.
     * @returns A Promise.
     */
    private async handleSignupButtonClick(event: Event): Promise<void> {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const address = this.addressInput.value;

        FrontendUtil.clearAllValidationErrors();

        if (!email) {
            FrontendUtil.showValidationError(this.emailInput, "Please enter an email address");
            return;
        }

        if (!FrontendUtil.validateEmail(email, "")) {
            FrontendUtil.showValidationError(this.emailInput, "Please enter a valid email address");
            return;
        }

        if (!password || password.length < 8) {
            FrontendUtil.showValidationError(this.passwordInput, "Please enter a password greater than 7 characters");
            return;
        }

        if (!FrontendUtil.validatePassword(password, confirmPassword)) {
            FrontendUtil.showValidationError(this.confirmPasswordInput, "Passwords do not match");
            return;
        }

        if (!address) {
            FrontendUtil.showValidationError(this.addressInput, "Please enter an address");
            return;
        }

        if (!FrontendUtil.validateAddress(address, "")) {
            FrontendUtil.showValidationError(this.addressInput, "Please enter a valid address");
            return;
        }

        if (!this.isCheckboxChecked()) {
            FrontendUtil.showValidationError(document.querySelector(".category-group"), "Please select at least one category");
            return;
        }

        this.user = {
            email,
            password,
            address,
            encodedInterestedCategories: FrontendUtil.checkboxesToOneHotEncoding(this.getCheckboxStatuses()).toString()
        };

        if (await ApiService.createUser(this.user)) {

            console.log("User created successfully");

            FrontendUtil.showSuccessMessage("Your account has been created successfully", this.signupGroupContainer, 2000, "/");
        }
    }

    /**
     * Gets the status of the checkboxes.
     * @returns An array that contains which checkboxes are checked.
     */
    private getCheckboxStatuses(): { id: string, checked: boolean }[] {
        // Queries all input elements of checkbox type
        const checkboxes = document.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"]");
            
        const statuses = Array.from(checkboxes).map(checkbox => {
            return {
                id: checkbox.id,
                checked: checkbox.checked
            };
        });
    
        return statuses;
    }
    
    /**
     * Gets if any of the checkboxes have been checked.
     * @returns If any of the checkbox have actually been checked.
     */
    private isCheckboxChecked = () =>
        this.getCheckboxStatuses().some(status => status.checked);
}

/**
 * Run the Signup page.
 */
ApiService.doesSessionExist().then(isLoggedIn => {
    if (isLoggedIn) {
        window.location.href = "/";
    }

    document.body.style.display = "block";

    const signup = new Signup();
});