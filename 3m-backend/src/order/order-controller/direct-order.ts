import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Order } from "../order-model";
import { Product } from "../../product/product-model";
import { body } from "express-validator";
import { Promo } from "../../promo/promo-model";

export const directValidator = [
    body("productID")
        .trim()
        .notEmpty()
        .withMessage("Product ID is required"),
    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("size")
        .trim()
        .notEmpty()
        .withMessage("Size is required"),
    body("colorCode")
        .trim()
        .notEmpty()
        .withMessage("Color code is required"),
    body("shippingAddress.street")
        .trim()
        .notEmpty()
        .withMessage("Street is required"),
    body("shippingAddress.city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),
    body("shippingAddress.phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),
];

interface IShippingAddress {
    street: string;
    city: string;
    phone: string;
}

interface IDirectRequest {
    productID: string;
    quantity: number;
    size: string;
    colorCode: string;
    shippingAddress: IShippingAddress;
    promoCode?: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const directOrder: RequestHandler<{}, IResponse, IDirectRequest> = async (req, res) => {
    const userID = req.user?.id;
    if (!userID) {
        return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const { productID, quantity, size, colorCode, shippingAddress, promoCode } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const product = await Product.findById(productID).session(session);
        if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Product not found" });
        }

        // Find the variant
        const variant = product.variants.find(
            (v) => v.size === size && v.colorCode === colorCode
        );

        if (!variant) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                message: `Variant (Size: ${size}, Color: ${colorCode}) is not available` 
            });
        }

        // Check stock
        if (variant.quantity < quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                message: `Insufficient stock for variant (Size: ${size}, Color: ${colorCode}). Available: ${variant.quantity}` 
            });
        }

        // Deduct variant stock
        variant.quantity -= quantity;
        await product.save({ session });

        // Calculate price (check if promotional offer is active)
        let itemPrice = product.price;
        if (product.offer && product.offer.discountedPrice !== undefined) {
            const now = new Date();
            const start = new Date(product.offer.startDate);
            const end = new Date(product.offer.endDate);
            if (now >= start && now <= end) {
                itemPrice = product.offer.discountedPrice;
            }
        }

        const calculatedTotal = itemPrice * quantity;

        const orderItems = [{
            productID: product._id,
            size,
            colorCode,
            quantity,
            price: itemPrice
        }];

        let shippingFee = 0;
        const city = shippingAddress?.city || "";
        const cairoGiza = ['القاهرة', 'الجيزة', 'Cairo', 'Giza'];
        const deltaAndCanal = [
            'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية', 'دمياط', 'بورسعيد', 'السويس', 'الإسماعيلية',
            'Alexandria', 'Qalyubia', 'Dakahlia', 'Sharqia', 'Monufia', 'Gharbia', 'Damietta', 'Port Said', 'Suez', 'Ismailia'
        ];
        
        if (cairoGiza.includes(city)) {
            shippingFee = 100;
        } else if (deltaAndCanal.includes(city)) {
            shippingFee = 80;
        } else {
            shippingFee = 60;
        }

        let discount = 0;
        if (promoCode) {
            const promo = await Promo.findOne({ code: promoCode.trim().toUpperCase(), isActive: true }).session(session);
            if (promo) {
                if (promo.discountType === "percentage") {
                    discount = Math.round(calculatedTotal * (promo.discountValue / 100));
                } else if (promo.discountType === "fixed") {
                    discount = Math.min(calculatedTotal, promo.discountValue);
                }
            }
        }

        const finalTotal = Math.max(0, calculatedTotal - discount + shippingFee);

        const [newOrder] = await Order.create([{
            userID,
            items: orderItems,
            totalPrice: finalTotal,
            shippingAddress,
            paymentMethod: "cash" 
        }], { session });

        await session.commitTransaction();
        session.endSession();

        await newOrder.populate([
            { path: "userID", select: "name email" },
            { path: "items.productID", select: "name imageCover" }
        ]);

        return res.status(201).json({
            message: "Direct order created successfully",
            data: newOrder
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error("Direct Order Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};
