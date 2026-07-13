import { RequestHandler } from "express";
import { Cart } from "../cart-model";

export const updateQuantity: RequestHandler<{ productID: string }, any, { quantity: number }> = async (req, res) => {
    try {
        const userID = req.user!.id;
        const { productID } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ userID });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productID.toString() === productID);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return res.status(200).json({
            message: "Cart updated successfully",
            data: cart
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
