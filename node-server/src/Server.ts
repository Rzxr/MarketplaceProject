import cors from "cors";
import express from "express";
import expressSession from "express-session";
import { BackendService } from "./BackendService";
import path from "path";
import { User } from "./CommerceEntity/User";
import { OperationType } from "./Utils/OperationType";
import { IItem } from "./Interfaces/IItem";
import { IItemFilter } from "./Interfaces/IItemFilter";

// Add Session Data interface to store the user.
declare module "express-session" {
    interface SessionData {
      user?: User;
    }
}

const controller = new BackendService();
controller.loadState();

const app = express();
app.use(express.json());

// Set up CORS policy to allow requests from the frontend that contains the session cookie (known as credentials).
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type"]
};

// Enables preflight for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const buildPath = path.join(__dirname, "../marketplace-web/dist");
app.use(express.static(buildPath));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self';");
    next();
});

// Set up the session middleware to store the user.
app.use(expressSession({
    secret: "secret-marketplace-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        // maxAge: 600000,
        maxAge: 6000000000000000,
    },
}));

/**
 * Route handler for the root /.
 */
app.get("/", (req, res) => {

    // If the user is not logged in, redirect to the login page.
    if (!req.session.user) {
        console.log(req.session);
        return res.redirect("/Login.html");
    }

    // If the user is logged in, serve the resource
    res.sendFile(path.join(buildPath, "index.html"));
});


// Session Endpoints

/**
 * Route handler for the session.
 */
app.get("/api/session", (req, res) => {
    if (req.session.user) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

/**
 * Route handler for the logout.
 */
app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true, message: "Logout successful" });
    });
});


// User Endpoints

/**
 * Route handler for the logging in the User.
 */
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await controller.authenticateUser(email, password);

        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials" });
            return;
        }

        req.session.user = user;
        res.json({ success: true, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the User from the session and sends it as a JSON response.
 */
app.get("/api/user/profile", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const userId = req.session.user!.id;

    console.log("User ID:", userId);

    controller.getUserManager().then(userManager => {
        const user = userManager.getUser(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user.toJSON());
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

/**
 * Route handler for account creation
 */
app.post("/api/user/profile", async (req, res) => {
    try {
        const success = await controller.performUserOperation(OperationType.ADD, req.body);

        if (!success) {
            res.status(500).json({ error: "Failed to create user" });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for updating the user profile.
 */
app.put("/api/user/profile", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performUserOperation(OperationType.UPDATE, req.body);

        if (!success) {
            res.status(500).json({ error: "Failed to update user" });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for user deletion.
 */
app.delete("/api/user/profile", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    console.log("Deleting user:", req.session.user);

    try {
        const success = await controller.performUserOperation(OperationType.DELETE, req.session.user);

        if (!success) {
            return res.status(500).json({ error: "Failed to delete user" });
        }

        req.session.destroy((error) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.status(200).json({ success: true, message: "Account deleted successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


// Item Endpoints

/**
 * Route handler for getting the Items from the backend using the ItemManager.
 * The Items are then converted to JSON and then sent as a JSON response through the /api/items endpoint.
 */
app.get("/api/items", (req, res) => {
    controller.getItemManager().then(itemManager => {
        const itemJson = Array.from(itemManager.getItems().values()).map(item => item.toJSON());
        res.json({ "item": itemJson });
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

/**
 * Route handler for Item creation.
 */
app.post("/api/item", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performItemOperation(OperationType.ADD, req.body);

        if (!success) {
            return res.status(500).json({ error: "Failed to create item" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for updating the Item.
 */
app.put("/api/item", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performItemOperation(OperationType.UPDATE, req.body);

        if (!success) {
            return res.status(500).json({ error: "Failed to update item" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for deleting the Item.
 */
app.delete("/api/item/:itemId", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const item = await controller.getItemManager().then(itemManager => itemManager.getItem(req.params.itemId));

    try {
        const success = await controller.performItemOperation(OperationType.DELETE, item as IItem);

        if (!success) {
            return res.status(500).json({ error: "Failed to delete item" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting an Item using its ID.
 */
app.get("/api/item/:itemId", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const itemId = req.params.itemId;

    try {
        const item = await controller.getItemManager().then(ItemManager => ItemManager.getItem(itemId));

        if (!item) {
            res.status(404).json({ error: "Item not found" });
            return;
        }

        res.json(item.toJSON());
    } catch (error) {
        res.status(500).json({ error: ((error) as Error).message });
    }
});

/**
 * Route handler for getting the Item by its name.
 */
app.get("/api/item/name/:itemName", async (req, res) => {
    console.log("Getting item by name:", req.params.itemName);

    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const itemName = req.params.itemName;

    try {
        const item = await controller.getItemManager().then(itemManager => itemManager.getItemByNameUsingBinarySearch(itemName));

        console.log("Item:", item);

        // Don't throw here we want to return null if the item is not found and let the frontend handle it
        if (!item) {
            res.json(null);
            return;
        }

        res.json(item.toJSON());

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the Items in alphabetical order.
 */
app.get("/api/items/alphabetical", async (req, res) => {
    try {
        const items = await controller.getItemManager().then(itemManager => itemManager.getItemsInAlphabeticalOrder());

        res.json(items.map(item => item.toJSON()));
    } catch (error: unknown) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the newest and available Items.
 */
app.get("/api/items/newest", async (req, res) => {
    try {
        const items = await controller.getItemManager().then(itemManager => itemManager.getNewestAndAvailableItems());

        res.json(items.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


/**
 * Router handler for getting the User's recommendations.
 */
app.get("/api/user/recommendations", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {

        // As all the users have a recommendation manager, we can get the recommendation manager using the user id.
        const recommendationManager = await controller.getRecommendationManagerById(req.session.user.id);

        const itemsToRecommend = Array.from(recommendationManager.findRecommendedItems().values());

        res.json(itemsToRecommend.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Router handler for getting the User's recommendations by category.
 */
app.get("/api/user/recommendations/categories", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {

        const recommendationManager = await controller.getRecommendationManagerById(req.session.user.id);

        const categories = recommendationManager.getUserCategoriesFromNewestOrder();

        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


// Basket Endpoints

/**
 * Route handler for getting the Basket from the backend using the BasketManager.
 * The Baskets are then converted to JSON and then sent as a JSON response through the /api/baskets endpoint.
 */
app.get("/api/user/basket", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const userId = req.session.user!.id;

    controller.getUserManager().then(userManager => {
        const user = userManager.getUser(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user.basket.toJSON());

    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

/**
 * Router handler for adding an Item to the Basket.
 */
app.post("/api/user/basket", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performBasketItemOperation(
            OperationType.ADD,
            { basketId: req.session.user.basket.id, itemId: req.body.itemId, quantity: 1, dateAdded: new Date(), userId: req.session.user.id});

        if (!success) {
            return res.status(500).json({ error: "Failed to add item to basket" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the Items in the Basket.
 */
app.get("/api/user/basket/items", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const userId = req.session.user!.id;

    controller.getUserManager().then(userManager => {
        const user = userManager.getUser(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user.basket.getItemsInBasketToJSON());

    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

/**
 * Router handler for removing an Item from the Basket.
 */
app.delete("/api/user/basket", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performBasketItemOperation(
            OperationType.DELETE,
            { basketId: req.session.user.basket.id, itemId: req.body.itemId, quantity: 1, dateAdded: new Date(), userId: req.session.user.id}
        );

        if (!success) {
            return res.status(500).json({ error: "Failed to remove item from basket" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


// Checkout and Order Endpoints

/**
 * Route handler for creating an Order from the Basket.
 */
app.post("/api/user/basket/checkout", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const success = await controller.performOrderOperation(OperationType.ADD, req.session.user!.id);

        if (!success) {
            return res.status(500).json({ error: "Failed to create order" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Router handler for checking out a single order
 */
app.post("/api/user/basket/quickcheckout", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const item = controller.getItemManager().then(itemManager => itemManager.getItem(req.body.itemId));

    try {
        const success = await controller.performOrderOperation(OperationType.ADD, req.session.user.id, req.body.itemId);

        if (!success) {
            return res.status(500).json({ error: "Failed to checkout order" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the most current order from the backend.
 */
app.get("/api/user/neworder", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const userId = req.session.user!.id;

    controller.getUserManager().then(userManager => {
        const user = userManager.getUser(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const order = user.getMostRecentOrder();

        if (!order) {
            res.json(null);
            return;
        }

        res.json(order.toJSON());
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

/**
 * Route handler for getting all the User's orders from the backend.
 */
app.get("/api/user/orders", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const userId = req.session.user!.id;

    controller.getUserManager().then(userManager => {
        const user = userManager.getUser(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user.getAllOrdersToJSON());
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});


// Seller Statistics Endpoints

/**
 * Route handler for getting the Seller's unsold items.
 */
app.get("/api/seller/items/unsold", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const items = await controller.getItemManager().then(itemManager => itemManager.getSellerUnsoldItems(req.session.user!.id));

        if (!items) {
            res.json(null);
            return;
        }

        res.json(items.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for getting the Seller's sold items.
 */
app.get("/api/seller/items/sold", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const items = await controller.getItemManager().then(itemManager => itemManager.getSellerSoldItems(req.session.user!.id));

        if (!items) {
            res.json(null);
            return;
        }

        res.json(items.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for adding a rating to an Item.
 */
app.post("/api/item/rating", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    try {
        const itemData: Partial<IItem> = {id: req.body.itemId, newRating: req.body.rating};
        console.log("Adding rating to item:", itemData);
        const success = await controller.performItemOperation(OperationType.UPDATE, itemData);

        if (!success) {
            return res.status(500).json({ error: "Failed to add rating" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Route handler for filtering the Items.
 */
app.post("/api/items/filter/", async (req, res) => {
    try {

        const filter = req.body as IItemFilter;
        const items = await controller.getItemManager().then(itemManager => itemManager.filterItems(filter));

        if (!items) {
            res.json(null);
            return;
        }

        res.json(items.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Get the items with the highest rating.
 */
app.get("/api/items/rated/highest", async (req, res) => {
    try {
        const items = await controller.getItemManager().then(itemManager => itemManager.getHighestRatedItems());

        if (!items) {
            res.json(null);
            return;
        }

        res.json(items.map(item => item.toJSON()));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * Updates the items from a trade.
 */
app.post("/api/item/trade", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "The user is not authenticated" });
    }

    const itemId1 = req.body.itemId;
    const itemId2 = req.body.idToTrade;

    try {
        const success = await controller.performTradeOperation(itemId1, itemId2);

        if (!success) {
            return res.status(500).json({ error: "Failed to create trade" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


app.listen(5000, () => console.log("server started on port 5000"));