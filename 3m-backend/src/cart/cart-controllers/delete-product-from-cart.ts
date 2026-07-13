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

        if (!mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid Product ID format" });
        }

        const cart = await Cart.findOneAndUpdate(
            { userID },
            { $pull: { items: { productID } } }, 
            { new: true }
        ).populate("items.productID", "name price imageCover");

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        return res.status(200).json({
            message: "Product removed from cart successfully",
            data: cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};