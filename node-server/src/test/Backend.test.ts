import { UserManager } from "../CommerceEntity/UserManager";
import { User } from "../CommerceEntity/User";
import { ItemManager } from "../CommerceEntity/ItemManager";
import { Item } from "../CommerceEntity/Item";
import { Order, OrderStatus } from "../CommerceEntity/Order";
import { Basket } from "../CommerceEntity/Basket";
import { OrderManager } from "../CommerceEntity/OrderManager";
import { BasketManager } from "../CommerceEntity/BasketManager";
import { RecommendationManager } from "../CommerceEntity/Recommendations/RecommendationManager";
import { id } from "../Utils/ID";
import { CategoriesEnum } from "../CommerceEntity/Recommendations/CategoriesEnum";

describe("UserManager", () => {
    let userManager: UserManager;
    let user: User;

    beforeEach(() => {
        userManager = new UserManager();
        user = new User("test@test.com", "password", "address", "0100000000000", new id().toString());
    });

    it("add a user", () => {
        userManager.addUser(user);
        expect(userManager.getUsers().has(user.id)).toBeTruthy();
    });

    it("delete a user", () => {
        userManager.addUser(user);
        expect(userManager.getUsers().has(user.id)).toBeTruthy();
        userManager.deleteUser(user.id);
        expect(userManager.getUsers().has(user.id)).toBeFalsy();
    });

    it("get all users", () => {
        userManager.addUser(user);
        expect(userManager.getUsers().size).toBe(1);
    });

    it("get a user by id", () => {
        userManager.addUser(user);
        expect(userManager.getUser(user.id)).toEqual(user);
    });

    it("update a user", () => {
        userManager.addUser(user);
        const updatedUser = userManager.updateUser({ id: user.id, email: "new@test.com" });
        expect(updatedUser?.email).toBe("new@test.com");
    });
});

describe("ItemManager", () => {
    let itemManager: ItemManager;

    beforeEach(() => {
        itemManager = new ItemManager();

        itemManager.addItem(new Item(
            "Apple", 1.99, "An Apple", 100, false, new id().toString(), "000000000001", 4.5, 10, null, null, null, new Date(), null, new id().toString()
        ));
        itemManager.addItem(new Item(
            "Banana", 0.99, "A Banana", 200, false, new id().toString(), "000000000001", 4.7, 20, null, null, null, new Date(), null, new id().toString()
        ));
        itemManager.addItem(new Item(
            "Orange", 2.99, "A Orange", 150, false, new id().toString(), "000000000001", 4.8, 15, null, null, null, new Date(), null, new id().toString()
        ));
    });

    describe("getItemByNameUsingBinarySearch", () => {
        it("return the correct item when it exists", () => {
            const item = itemManager.getItemByNameUsingBinarySearch("Banana");
            expect(item).not.toBeNull();
            expect(item?.name).toBe("Banana");
        });

        it("return null when the item does not exist", () => {
            const item = itemManager.getItemByNameUsingBinarySearch("Test");
            expect(item).toBeNull();
        });
    });
});

describe("OrderManager", () => {
    let orderManager: OrderManager;

    const item = new Item("Apple", 1.99, "An Apple", 100, false, new id().toString(), "000000000001", 4.5, 10, null, null, null, new Date(), null, new id().toString());
    const itemId: string = new id().toString();

    beforeEach(() => {
        orderManager = new OrderManager();
        orderManager.addOrder(new Order(itemId, OrderStatus.PURCHASED, new Date(), 100, itemId, [item]));
        orderManager.addOrder(new Order(new id().toString(), OrderStatus.PURCHASED, new Date(), 300, itemId, [item]));
    });

    describe("getOrder", () => {
        it("return the correct order when it exists", () => {
            const order = orderManager.getOrder(itemId);
            expect(order).not.toBeUndefined();
            expect(order?.id).toBe(itemId);
        });
    });

    describe("deleteOrder", () => {
        it("should delete the correct order", () => {
            orderManager.deleteOrder(itemId);
            const order = orderManager.getOrder(itemId);
            expect(order).toBeUndefined();
        });
    });
});

describe("BasketManager", () => {
    let basketManager: BasketManager;

    const basketId: string = new id().toString();

    beforeEach(() => {
        basketManager = new BasketManager();
        basketManager.addBasket(new Basket(new id().toString(), basketId));
        basketManager.addBasket(new Basket(new id().toString(), new id().toString()));
    });

    describe("addBasket", () => {
        it("add a new basket", () => {
            const testId = new id().toString();
            const newBasket = new Basket(basketId, testId);

            basketManager.addBasket(newBasket);
            const basket = basketManager.getBasket(testId);
            expect(basket).not.toBeUndefined();
            expect(basket?.id).toBe(testId);
        });
    });

    describe("getBasket", () => {
        it("return the correct basket when it exists", () => {
            const basket = basketManager.getBasket(basketId);
            expect(basket).not.toBeUndefined();
            expect(basket?.id).toBe(basketId);
        });
    });

    describe("deleteBasket", () => {
        it("delete the correct basket", () => {
            basketManager.deleteBasket(basketId);
            const basket = basketManager.getBasket(basketId);
            expect(basket).toBeUndefined();
        });
    });
});

describe("RecommendationManager", () => {
    let recommendationManager: RecommendationManager;

    const item = new Item("Apple", 1.99, "An Apple", 100, false, new id().toString(), "000000000001", 4.5, 10, null, null, null, new Date(), null, new id().toString());
    const item2 = new Item("Test", 1.99, " ", 100, false, new id().toString(), "0100000000000", 4.5, 10, null, null, null, new Date(), null, new id().toString());
    const item3 = new Item("Test 2", 1.99, " ", 100, false, new id().toString(), "0100000001000", 4.5, 10, null, null, null, new Date(), null, new id().toString());

    const user = new User("test@test.com", "password", "address", "0100000000000", new id().toString());

    beforeEach(() => {
        recommendationManager = new RecommendationManager(user, [item, item2, item3]);
    });

    it("getUserPurchasedCategories", () => {
        const userCategories = recommendationManager.getUserPurchasedCategories();
        expect(userCategories).toBe("000000000000");
    });

    it("createItemVector", () => {
        const itemVector = recommendationManager.createItemVector(item);
        expect(itemVector).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });

    it("createUserVector", () => {
        const userVector = recommendationManager.createUserVector(new Set([CategoriesEnum.ELECTRONICS]));
        expect(userVector).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("findRecommendations", () => {
        const recommendations = recommendationManager.findRecommendedItems();
        expect(recommendations).toEqual(new Map([[item2.id, item2], [item3.id, item3], [item.id, item]]));
    });
});