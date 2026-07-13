import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Order } from "../order-model";

interface IRequest {
    status: string;
}
interface IResponse {
    message: string;
    data?: any;
}

export const updateOrderStatus: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Order ID format" });
        }

        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("userID", "name email");

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            data: updatedOrder
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};