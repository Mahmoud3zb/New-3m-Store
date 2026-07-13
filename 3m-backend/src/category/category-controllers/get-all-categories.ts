// for admin
import { RequestHandler } from "express";
import { Category } from "../category-model";


export const getAllCategories: RequestHandler = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const categories = await Category.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Category.countDocuments();

        return res.status(200).json({
            message: "Categories fetched successfully",
            page,
            limit,
            total,
            data: categories
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};