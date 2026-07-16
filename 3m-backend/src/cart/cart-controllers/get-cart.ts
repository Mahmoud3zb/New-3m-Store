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
            .populate("items.productID", "name price imageCover offer")
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
                let itemPrice = item.productID.price;
                if (item.productID.offer && item.productID.offer.discountedPrice !== undefined) {
                    const now = new Date();
                    const start = new Date(item.productID.offer.startDate);
                    const end = new Date(item.productID.offer.endDate);
                    if (now >= start && now <= end) {
                        itemPrice = item.productID.offer.discountedPrice;
                    }
                }
                totalCartPrice += itemPrice * item.quantity;
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