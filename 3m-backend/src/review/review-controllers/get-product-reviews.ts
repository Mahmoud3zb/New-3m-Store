import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Review } from "../review-model";

export const getProductReviews: RequestHandler<{ productID: string }> = async (req, res) => {
    try {
        const { productID } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid product id format" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const reviews = await Review.find({ productID })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("userID", "name email")
            .lean();
        const total = await Review.countDocuments({ productID });
        return res.status(200).json({
            message: "Reviews fetched successfully",
            page,
            limit,
            total,
            data: reviews
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};