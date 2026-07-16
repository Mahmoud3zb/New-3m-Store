import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Cart } from "../cart-model";
import { body } from "express-validator";
import { Product } from "../../product/product-model";

export const addToCartValidator = [
    body("productID")
        .trim()
        .notEmpty()
        .withMessage("Product ID is required")
        .isMongoId()
        .withMessage("Invalid Product ID format"),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a valid integer greater than 0"),
];

interface IRequest {
    productID: string;
    quantity: number;
    size?: string;
    colorCode?: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const addToCart: RequestHandler<{}, IResponse, IRequest> = async (req,res) => {
    try {
        const userID = req.user?.id;

        const { productID, quantity, size, colorCode } = req.body;

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Validate variant stock if size/color are provided
        if (size && colorCode) {
            const variant = product.variants.find(
                (v) => v.size === size && v.colorCode === colorCode
            );
            if (!variant) {
                return res.status(400).json({ 
                    message: `Variant (Size: ${size}, Color: ${colorCode}) is not available` 
                });
            }
            if (quantity > variant.quantity) {
                return res.status(400).json({ 
                    message: `Only ${variant.quantity} items available for this variant` 
                });
            }
        }

        let cart = await Cart.findOne({ userID });

        if (!cart) {
            cart = await Cart.create({
                userID,
                items: [{ productID, quantity, size, colorCode }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => 
                    item.productID.toString() === productID && 
                    item.size === size && 
                    item.colorCode === colorCode
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productID: new mongoose.Types.ObjectId(productID),
                    size,
                    colorCode,
                    quantity,
                });
            }

            await cart.save();
        }

        return res.status(200).json({
            message: "Product added to cart successfully",
            data: cart,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
