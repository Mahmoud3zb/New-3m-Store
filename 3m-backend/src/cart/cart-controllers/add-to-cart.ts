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
}

interface IResponse {
    message: string;
    data?: any;
}

export const addToCart: RequestHandler<{}, IResponse, IRequest> = async (req,res) => {
    try {
        const userID = req.user?.id;

        const { productID, quantity } = req.body;

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (quantity > product.quantity) {
            return res.status(400).json({ 
                message: `Only ${product.quantity} items available in stock` 
            });
        }


        let cart = await Cart.findOne({ userID });

        if (!cart) {
            cart = await Cart.create({
                userID,
                items: [{ productID, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.productID.toString() === productID,
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productID: new mongoose.Types.ObjectId(productID),
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
