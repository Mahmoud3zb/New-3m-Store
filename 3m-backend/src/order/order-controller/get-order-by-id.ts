import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Order } from "../order-model";

export const getOrderById: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid order id format" });
        }

        const order = await Order.findById(req.params.id)
            .populate("userID", "name email")
            .populate("items.productID", "name imageCover") 
            .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (req.user?.role !== "admin" && order.userID._id.toString() !== req.user?.id) {
            return res.status(403).json({ message: "Forbidden: You are not allowed to view this order" });
        }

        return res.status(200).json({
            message: "Order fetched successfully",
            data: order
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};