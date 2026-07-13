import { RequestHandler } from "express";
import { Product } from "../product-model";
import mongoose from "mongoose";


interface IRequest {
    name: string;
    description: string;
    image?: string;
    imageCover?: string;
    price: number;
    quantity: number;
    categoryID: string
}

interface IResponse {
    message: string;
    data?: any
}

export const updateProduct: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id format"
            });
        }
        const updateData = { ...req.body };
        if (req.file?.path) {
            updateData.imageCover = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData, 
            { new: true })
            .populate("categoryID", "name")
            .lean();
        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}