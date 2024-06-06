import { id } from "../Utils/ID";
import { ICommerceEntity } from "./ICommerceEntity";

/**
 * An interface that represents a User.
 */
export interface IUser extends ICommerceEntity {
    id: string;
    email: string;
    password: string;
    address: string;
    encodedInterestedCategories: string;
}