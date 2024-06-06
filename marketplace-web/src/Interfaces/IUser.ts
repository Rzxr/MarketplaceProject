/**
 * An interface that represents a User.
 */
export interface IUser {
    id: string;
    email: string;
    password: string;
    address: string;
    encodedInterestedCategories: string;
}