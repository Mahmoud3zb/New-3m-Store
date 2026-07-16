import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Cart } from "../cart-model";

interface IResponse {
    message: string;
    data?: any
}

export const removeFromCart: RequestHandler<{ productID: string }, IResponse, {}> = async (req, res) => {
    try {
        const userID = req.user!.id;
        const { productID } = req.params;
        const { size, colorCode } = req.query as { size?: string; colorCode?: string };

        if (!mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid Product ID format" });
        }

        const cart = await Cart.findOne({ userID });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the index of the specific variant item to remove
        const itemIndex = cart.items.findIndex(item => {
            const idMatch = item.productID.toString() === productID;
            const sizeMatch = size ? item.size === size : true;
            const colorMatch = colorCode ? item.colorCode === colorCode : true;
            return idMatch && sizeMatch && colorMatch;
        });

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product variant not found in cart" });
        }

        // Remove only the matched variant item
        cart.items.splice(itemIndex, 1);
        await cart.save();

        return res.status(200).json({
            message: "Product removed from cart successfully",
            data: cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};