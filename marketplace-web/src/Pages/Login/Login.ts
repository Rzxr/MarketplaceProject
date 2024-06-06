import "./Login.css";
import { ApiService } from "../../ApiService";

/**
 * A class representing the Login page.
 */
class Login {
    private form: HTMLFormElement;

    private errorMessage = document.querySelector(".error-message") as HTMLParagraphElement;
    private emailBox = document.querySelector(".email-box") as HTMLInputElement;
    private passwordBox = document.querySelector(".password-box") as HTMLInputElement;

    /**
     * Creates a new instance of the Login page.
     */
    constructor() {
        this.initialiseEventListeners();
    }

    /**
     * Initialises the event listeners for the Login page.
     */
    private initialiseEventListeners(): void {
        document.addEventListener("DOMContentLoaded", () => {
            this.form = document.querySelector(".login-form") as HTMLFormElement;
            this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
        });
    }

    /**
     * Handles the form submission.
     * @param event The form submission event.
     */
    private async handleFormSubmit(event: Event): Promise<void> {
        event.preventDefault();
    
        // Get the email and password from the form inputs
        const email = (this.form.querySelector(".email-box") as HTMLInputElement).value;
        const password = (this.form.querySelector(".password-box") as HTMLInputElement).value;

        if (await ApiService.postLogin(email, password)) {

            // Redirect the user to the home page
            window.location.href = "/";
            return;
        }

        this.errorMessage.textContent = "Invalid Credentials";
        this.errorMessage.style.display = "block";
        this.emailBox.style.border = "1px solid red";
        this.passwordBox.style.border = "1px solid red";
        this.errorMessage.style.visibility = "visible";
    }
}

// Run the Login page
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loginPage = new Login();
