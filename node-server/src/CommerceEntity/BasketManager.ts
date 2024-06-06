import { IBasket } from "../Interfaces/IBasket";
import { Basket } from "./Basket";
import { IBasketItem } from "../Interfaces/IBasketItem";
import { id } from "../Utils/ID";

/**
 * A class that manages Baskets.
 */
export class BasketManager {
    private _baskets: Map<string, Basket>;

    /**
     * Constructs a BasketManager.
     */
    public constructor() {
        this._baskets = new Map();
    }

    /**
     * Adds a Basket.
     * @param basket The Basket.
     */
    public addBasket(basket: Basket) {
        this._baskets.set(basket.id, basket);
    }

    /**
     * Deletes a Basket.
     * @param basketId The id.
     */
    public deleteBasket(basketId: string) {
        this._baskets.delete(basketId);
    }

    /**
     * Gets the Baskets
     * @returns The Baskets.
     */
    public getBaskets(): Map<string, Basket>  {
        return this._baskets;
    }
    
    /**
     * Gets a Basket.
     * @param basketId The id.
     * @returns The Basket or undefined.
     */
    public getBasket(basketId: string): Basket | undefined {
        if (typeof basketId === "string") {
            basketId = new id(basketId).toString();
        }

        for (const basket of this._baskets.values()) {
            if (basket.id === basketId) {
                return basket;
            }
        }
    }

    /**
     * Registers the Baskets.
     * @param baskets The Baskets.
     * @param basketItems The BasketItems.
     */
    public registerBaskets(baskets: IBasket[], basketItems: IBasketItem[]) {
        baskets.forEach((basket) => {
            this.addBasket(this.reconstructBasket(basket));
        });

        for (const basketItem of basketItems) {
            this.getBasket(basketItem.basketId)?.addItem(basketItem.itemId, basketItem.quantity, basketItem.dateAdded);
        }
    }

    /**
     * Registers a Basket.
     * @param basket The Basket.
     * @returns The Basket.
     */
    public registerBasket(basket: IBasket): Basket {
        const newBasket = this.reconstructBasket(basket);
        this.addBasket(newBasket);
        return newBasket;
    }

    /**
     * Updates a Basket.
     * @param basket The Basket.
     * @returns The Basket or undefined.
     */
    public updateBasket(basket: Partial<IBasket>): IBasket | undefined {
        const basketId = basket.id;

        if (!basketId) {
            return;
        }

        const existingBasket = this._baskets.get(basketId);

        if (!existingBasket) {
            return;
        }

        existingBasket.update(basket);

        return existingBasket as IBasket;
    }

    /**
     * Adds a BasketItem.
     * @param basketItem The BasketItem.
     */
    public addBasketItem(basketItem: IBasketItem) {
        this.getBasket(basketItem.basketId)?.addItem(basketItem.itemId, basketItem.quantity, basketItem.dateAdded);
    }

    /**
     * Deletes a BasketItem.
     * @param basketId The Basket id.
     * @param itemId The Item id.
     */
    public deleteBasketItem(basketId: string, itemId: string) {
        this.getBasket(basketId)?.deleteItem(itemId);
    }

    /**
     * Reconstructs a Basket.
     * @param basket The Basket.
     * @returns The Basket.
     */
    private reconstructBasket(basket: IBasket) {
        return new Basket(basket.userId, basket.id);
    }
}