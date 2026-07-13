import { RequestHandler } from "express";
import { IProduct, Product } from "../product-model";
import mongoose from "mongoose";



interface IResponse {
    message: string;
    data?: IProduct;
}
export const getProductById: RequestHandler<{ id: string }, IResponse,{}> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product id format" });
            
        }
        const product = await Product.findById(req.params.id)
        .lean()
        .populate("categoryID", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};