import { RequestHandler } from "express";
import { Cart } from "../cart-model";

interface IResponse {
    message: string;
    data?: any;
    totalCartPrice?: number;
}

export const getCart: RequestHandler<{}, IResponse, {}> = async (req, res) => {
    try {
        const userID = req.user!.id;

        const cart = await Cart.findOne({ userID })
            .populate("items.productID", "name price imageCover")
            .lean();

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                data: { items: [] },
                totalCartPrice: 0
            });
        }
        let totalCartPrice = 0;

        cart.items.forEach((item: any) => {
            if (item.productID && item.productID.price) {
                totalCartPrice += item.productID.price * item.quantity;
            }
        });

        return res.status(200).json({
            message: "Cart fetched successfully",
            totalCartPrice,
            data: cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};