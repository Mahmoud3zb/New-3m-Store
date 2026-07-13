import { Router } from "express";
import { addToCart, addToCartValidator } from "./cart-controllers/add-to-cart";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { getCart } from "./cart-controllers/get-cart";
import { clearCart } from "./cart-controllers/clear-cart";
import { removeFromCart } from "./cart-controllers/delete-product-from-cart";
import { updateQuantity } from "./cart-controllers/update-quantity";

const router = Router();

router.post(
    "/", 
    isAuthenticated,
    addToCartValidator,
    handleValidationErrors,
    addToCart
);
router.get("/", isAuthenticated, getCart);
router.put("/:productID", isAuthenticated, updateQuantity);
router.delete("/clear", isAuthenticated, clearCart);
router.delete("/:productID", isAuthenticated, removeFromCart);

export default router;