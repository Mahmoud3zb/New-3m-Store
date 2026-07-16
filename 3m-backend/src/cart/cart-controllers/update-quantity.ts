import { RequestHandler } from "express";
import { Cart } from "../cart-model";

interface IUpdateBody {
    quantity: number;
    size?: string;
    colorCode?: string;
}

export const updateQuantity: RequestHandler<{ productID: string }, any, IUpdateBody> = async (req, res) => {
    try {
        const userID = req.user!.id;
        const { productID } = req.params;
        const { quantity, size, colorCode } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ userID });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Match by productID + size + colorCode to target the correct variant
        const itemIndex = cart.items.findIndex(item => {
            const idMatch = item.productID.toString() === productID;
            const sizeMatch = size ? item.size === size : true;
            const colorMatch = colorCode ? item.colorCode === colorCode : true;
            return idMatch && sizeMatch && colorMatch;
        });

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product variant not found in cart" });
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
