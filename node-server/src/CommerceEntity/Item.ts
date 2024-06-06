import { id } from "../Utils/ID";
import { IItem } from "../Interfaces/IItem";
import { IItemImage } from "../Interfaces/IItemImage";
import { CategoriesEnum } from "./Recommendations/CategoriesEnum";
import { BackendUtils } from "../Utils/BackendUtils";

/**
 * A class that represents an Item.
 */
export class Item implements IItem {
    private _id: string;
    private _name: string;
    private _price: number;

    private _description: string;
    private _quantityAvailable: number;
    private _isPurchased: boolean;
    
    // private _images: Map<string, IItemImage> = new Map();
    private _image: string | null;
    private _sellerId: string;
    private _buyerId: string | null;
    private _orderId: string | null;
    private _basketId: string | null;

    private _dateAdded: Date;
    private _categories = new Set<CategoriesEnum>();

    private _averageRating: number;
    private _numOfRatings: number;

    /**
     * Constructs an Item.
     * @param name The name of the Item.
     * @param price The price of the Item.
     * @param description The description of the Item.
     * @param quantityAvailable The quantity of the Item available.
     * @param isPurchased The purchase status of the Item.
     * @param sellerId The id of the User selling the Item.
     * @param encodedCategories The encoded categories of the Item.
     * @param averageRating The average rating of the Item.
     * @param numOfRatings The number of ratings of the Item.
     * @param buyerId The id of the User that has bought the Item.
     * @param orderId The id of the Order that the Item is in.
     * @param basketId The id of the Basket that the Item is in.
     * @param dateAdded The date the Item was added.
     * @param The Item image.
     * @param iid The id of the Item.
     */
    public constructor(
        name: string,
        price: number,
        description: string,
        quantityAvailable: number,
        isPurchased: boolean = false,
        sellerId: string,
        encodedCategories: string,
        averageRating: number,
        numOfRatings: number,
        buyerId: string | null,
        orderId: string | null,
        basketId: string | null,
        dateAdded: Date | null,
        image: string | null,
        iid: string | undefined
    ) {
        this._id = typeof iid === "undefined" ?  new id().toString() : iid;
        this._name = name;
        this._price = price;
        this._description = description;
        this._quantityAvailable = quantityAvailable;
        this._isPurchased = isPurchased;
        this._sellerId = sellerId;
        this._buyerId = buyerId;
        this._orderId = orderId;
        this._basketId = basketId;
        // this._images = new Map();
        this._image = image;

        this._dateAdded = new Date();

        if (dateAdded !== null) {
            this._dateAdded = dateAdded;
        }

        this._categories = BackendUtils.convertEncodedCategoriesToSet(encodedCategories);

        this._averageRating = averageRating;
        this._numOfRatings = numOfRatings;
    }

    /**
     * Gets the Item's id.
     * @returns The Item's id.
     */
    public get id() {
        return this._id;
    }

    /**
     * Sets the Item's id.
     * @param id The Item's id.
     */
    public get name() {
        return this._name;
    }

    /**
     * Sets the Item's name.
     * @param name The Item's name.
     */
    public set name(name: string) {
        this._name = name;
    }

    /**
     * Gets the Item's price.
     * @returns The Item's price.
     */
    public get price() {
        return this._price;
    }

    /**
     * Sets the Item's price.
     * @param price The Item's price.
     */
    public set price(price: number) {
        this._price = price;
    }

    /**
     * Gets the Item's description.
     * @returns The Item's description.
     */
    public get description() {
        return this._description;
    }

    /**
     * Sets the Item's description.
     * @param description The Item's description.
     */
    public set description(description: string) {
        this._description = description;
    }

    /**
     * Gets the Item's purchase status.
     * @returns The Item's purchase status.
     */
    public get isPurchased() {
        return this._isPurchased;
    }

    /**
     * Sets the Item's purchase status.
     * @param isPurchased The Item's purchase status.
     */
    public set isPurchased(isPurchased: boolean) {
        this._isPurchased = isPurchased;
    }

    /**
     * Gets the Item's quantity available.
     * @returns The Item's quantity available.
     */
    public get quantityAvailable() {
        return this._quantityAvailable;
    }

    /**
     * Sets the Item's quantity available.
     * @param quantityAvailable The Item's quantity available.
     */
    public set quantityAvailable(quantityAvailable: number) {
        this._quantityAvailable = quantityAvailable;
    }

    // /**
    //  * Gets the Item's image paths.
    //  * @returns The Item's image paths.
    //  */
    // public get images(): Map<string, IItemImage> {
    //     return this._images;
    // }

    // /**
    //  * Adds an image to the Item.
    //  * @param image The image.
    //  */
    // public addImage(image: IItemImage) {
    //     if (this._images === undefined) {
    //         console.log("images is undefined");
    //         return;
    //     }

    //     this._images.set(image.id, image);
    // }

    /**
     * Gets the Item's image path.
     */
    public get image() {
        return this._image;
    }

    /**
     * Sets the Item's image path.
     * @param image The Item's image path.
     */
    public set image(image: string | null) {
        this._image = image;
    }

    /**
     * Sets the Item's image paths.
     * @param images The Item's image paths.
     */
    public get sellerId() {
        return this._sellerId;
    }

    /**
     * Sets the Item's seller id.
     * @param sellerId The Item's seller id.
     */
    public set sellerId(sellerId: string) {
        this._sellerId = sellerId;
    }

    /**
     * Gets the Item's buyer id.
     * @returns The Item's buyer id.
     */
    public get buyerId(): string | null {
        return this._buyerId;
    }

    /**
     * Sets the Item's buyer id.
     * @param buyerId The Item's buyer id.
     */
    public set buyerId(buyerId: string) {
        this._buyerId = buyerId;
    }

    /**
     * Gets the Item's order id.
     * @returns The Item's order id.
     */
    public get orderId(): string | null {
        return this._orderId;
    }

    /**
     * Sets the Item's order id.
     * @param orderId The Item's order id.
     */
    public set orderId(orderId: string) {
        this._orderId = orderId;
    }

    /**
     * Gets the Item's basket id.
     * @returns The Item's basket id.
     */
    public get basketId(): string | null {
        return this._basketId;
    }

    /**
     * Sets the Item's basket id.
     * @param basketId The Item's basket id.
     */
    public set basketId(basketId: string | null) {
        this._basketId = basketId;
    }

    /**
     * Gets the Item's date added.
     * @returns The Item's date added.
     */
    public get dateAdded(): Date {
        return this._dateAdded;
    }

    /**
     * Gets the Item's encoded categories.
     * @returns The Item's categories.
     */
    public get encodedCategories(): string {
        return BackendUtils.convertSetToEncodedCategories(this._categories);
    }

    /**
     * Gets the Item's categories.
     */
    public get categories(): Set<CategoriesEnum> {
        return this._categories;
    }

    /**
     * Adds an category to the Item.
     * @param category The category to add.
     */
    public addCategory(category: CategoriesEnum) {
        this._categories.add(category);
    }

    /**
     * Gets the Item's average rating.
     */
    public get averageRating(): number {
        return this._averageRating;
    }

    /**
     * Gets the Item's number of ratings.
     */
    public get numOfRatings(): number {
        return this._numOfRatings;
    }

    /**
     * Updates the Item's data.
     * @param itemData The item data to update.
     */
    public update(itemData: Partial<IItem>) {
        if (itemData.name) {
            this._name = itemData.name;
        }

        if (itemData.price) {
            this._price = itemData.price;
        }

        if (itemData.description) {
            this._description = itemData.description;
        }

        if (itemData.quantityAvailable) {
            this._quantityAvailable = itemData.quantityAvailable;
        }

        if (itemData.isPurchased) {
            this._isPurchased = itemData.isPurchased;
        }

        if (itemData.sellerId) {
            this._sellerId = itemData.sellerId;
        }

        if (itemData.buyerId) {
            this._buyerId = itemData.buyerId;
        }

        if (itemData.orderId) {
            this._orderId = itemData.orderId;
        }

        if (itemData.basketId) {
            this._basketId = itemData.basketId;
        }

        if (itemData.encodedCategories) {
            this._categories = BackendUtils.convertEncodedCategoriesToSet(itemData.encodedCategories);
        }

        if (itemData.dateAdded) {
            this._dateAdded = itemData.dateAdded;
        }

        if (itemData.image) {
            this._image = itemData.image;
        }
        
        if (typeof itemData.newRating === "undefined") {
            return;
        }

        // Update the rating if there's a new rating
        if (itemData.newRating !== undefined || itemData.newRating !== null || !itemData.newRating) {
            this.updateRating(itemData.newRating!);
        }
    }

    /**
     * Updates the Item's rating.
     * @param newRating The new rating to update.
     */
    public updateRating(newRating: number) {
        this._numOfRatings++;

        // Get the new average rating by using the previous average rating and multiplying it by the number of ratings - 1, 
        // then adding the new rating and dividing by the number of ratings.
        this._averageRating = (this._averageRating * (this._numOfRatings - 1) + newRating) / this._numOfRatings;
    }

    /**
     * Converts the Item to a JSON object.
     * @returns A Record of the Item to be used with JSON.stringify.
     */
    public toJSON(): Record<string, unknown> {
        return {
            id: this._id,
            name: this._name,
            price: this._price,

            description: this._description,
            quantityAvailable: this._quantityAvailable,
            isPurchased: this._isPurchased,

            // images: Array.from(this._images.entries()).map(([id, image]) => ({
            //     id: id,
            //     path: image.imagePath
            // })),

            image: this._image,

            sellerId: this._sellerId,
            buyerId: this._buyerId,
            orderId: this._orderId,
            basketId: this._basketId,
            dateAdded: this._dateAdded,

            encodedCategories: BackendUtils.convertSetToEncodedCategories(this._categories),

            averageRating: this._averageRating,
            numOfRatings: this._numOfRatings
        };
    }
}