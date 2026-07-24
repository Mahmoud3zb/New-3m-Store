import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Order } from "../order-model";

interface IRequest {
    status?: string;
    isPaid?: boolean;
}
interface IResponse {
    message: string;
    data?: any;
}

export const updateOrderStatus: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Order ID format" });
        }

        const updateFields: any = {};

        if (status !== undefined) {
            const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            updateFields.status = status;
        }

        if (isPaid !== undefined) {
            updateFields.isPaid = isPaid;
            if (isPaid) {
                updateFields.paidAt = new Date();
            } else {
                updateFields.paidAt = null;
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No update fields provided" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).populate("userID", "name email");

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order updated successfully",
            data: updatedOrder
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};