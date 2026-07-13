import { RequestHandler } from "express";
import { Product } from "../product-model";


interface IRequest {
    name: string;
    description: string;
    price: number;
    quantity: number;
    categoryID: string;
}
interface IResponse {
    message: string;
    data?: any
}
export const addProduct: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    try {
        const { name, description , price, quantity, categoryID } = req.body;
        const userID = req.user?.id
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized: Admin ID not found" });
        }
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({
                message: "Product name already exists"
            });
        }
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageCoverUrl = files?.imageCover?.[0]?.path;
        
        const imagesUrls = files?.images?.map(file => file.path) || [];
        if (!imageCoverUrl) {
            return res.status(400).json({ message: "Cover image is required" });
        }
        const product = await Product.create({
            name,
            description,
            imageCover: imageCoverUrl,
            images: imagesUrls,
            price,
            quantity,
            categoryID,
            userID
        });
        return res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}