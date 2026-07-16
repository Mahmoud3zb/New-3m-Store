import { RequestHandler } from "express";
import { Product } from "../product-model";
import type { IProductVariant } from "../product-model";

interface IRequest {
    name: string;
    description: string;
    price: number;
    categoryID: string;
    variants: IProductVariant[] | string; // Can arrive as JSON string from form-data
}

interface IResponse {
    message: string;
    data?: any;
}

export const addProduct: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    try {
        const { name, description, price, categoryID } = req.body;
        const userID = req.user?.id;

        if (!userID) {
            return res.status(401).json({ message: "Unauthorized: Admin ID not found" });
        }

        // Parse variants — they may arrive as a JSON string from multipart/form-data
        let variants: IProductVariant[] = [];
        if (req.body.variants) {
            if (typeof req.body.variants === "string") {
                try {
                    variants = JSON.parse(req.body.variants);
                } catch {
                    return res.status(400).json({ message: "Invalid variants format. Must be a valid JSON array." });
                }
            } else {
                variants = req.body.variants;
            }
        }

        if (!variants || variants.length === 0) {
            return res.status(400).json({ message: "At least one variant (size & color) is required." });
        }

        // Parse offer if exists
        let offerObj: any = undefined;
        if ((req.body as any).offer) {
            if ((req.body as any).offer === "") {
                offerObj = undefined;
            } else if (typeof (req.body as any).offer === "string") {
                try {
                    offerObj = JSON.parse((req.body as any).offer);
                } catch {
                    return res.status(400).json({ message: "Invalid offer format. Must be a valid JSON object." });
                }
            } else {
                offerObj = (req.body as any).offer;
            }
        }

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
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
            variants,
            categoryID,
            offer: offerObj,
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