import { RequestHandler } from "express";
import { Cart } from "../cart-model";


interface IResponse {
    message: string,
    data?: any
}
export const clearCart: RequestHandler<{}, IResponse, {}> = async (req, res) => {
    try {
        const userID = req.user!.id;

        const cart = await Cart.findOneAndUpdate(
            { userID },
            { items: [] }, 
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        return res.status(200).json({
            message: "Cart cleared successfully",
            data: cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};