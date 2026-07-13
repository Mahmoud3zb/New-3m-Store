import { RequestHandler } from "express";
import { Product } from "../product-model";
import mongoose from "mongoose";

export const getAllProducts: RequestHandler = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const filterObj: any = {};

        if (req.query.keyword) {
            filterObj.name = {
                $regex: req.query.keyword as string,
                $options: "i", // case-insensitive (note it mohamed)
            };
        }

        if (req.query.categoryID) {
            if (!mongoose.Types.ObjectId.isValid(req.query.categoryID as string)) {
                return res.status(400).json({ message: "Invalid category ID format" });
            }
            filterObj.categoryID = req.query.categoryID;
        }

        const products = await Product.find(filterObj)
            .populate("categoryID", "name")
            .sort(req.query.sort ? String(req.query.sort) : { createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(filterObj);

        return res.status(200).json({
            message: "Products fetched successfully",
            page,
            limit,
            total,
            data: products,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};