import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Order } from "../order-model";
import { Cart } from "../../cart/cart-model";
import { Product } from "../../product/product-model";
import { Promo } from "../../promo/promo-model";
import { body } from "express-validator";
import { sendOrderConfirmation } from "../../services/notification-service";

export const validator = [
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
    body("paymentMethod")
        .trim()
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(["cash", "card"])
        .withMessage("Payment method must be 'cash' or 'card'")
];

interface IShippingAddress {
    street: string;
    city: string;
    phone: string;
}

interface IRequest {
    shippingAddress: IShippingAddress;
    paymentMethod?: string;
    promoCode?: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const createOrder: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    const userID = req.user?.id;
    if (!userID) {
        return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const { shippingAddress, paymentMethod, promoCode } = req.body;

    // Start a MongoDB session and transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Retrieve the user's cart
        const cart = await Cart.findOne({ userID }).session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Your cart is empty" });
        }

        let calculatedTotal = 0;
        const orderItems: any[] = [];

        // 2. Validate variants & stock levels for each cart item
        for (const item of cart.items) {
            const product = await Product.findById(item.productID).session(session);
            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "Product no longer exists" });
            }

            // Cast item to allow retrieving size and colorCode
            const cartItem = item as any;
            const requestedSize = cartItem.size;
            const requestedColorCode = cartItem.colorCode;

            if (!requestedSize || !requestedColorCode) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `Missing variant selection (size/color) for product: ${product.name}` 
                });
            }

            // Find matching variant on the product
            const variant = product.variants.find(
                (v) => v.size === requestedSize && v.colorCode === requestedColorCode
            );

            if (!variant) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `Variant (Size: ${requestedSize}, Color: ${requestedColorCode}) is not available for product: ${product.name}` 
                });
            }

            // Verify if requested quantity is available
            if (variant.quantity < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `Insufficient stock for product ${product.name} (Variant - Size: ${requestedSize}, Color: ${requestedColorCode}). Available: ${variant.quantity}, Requested: ${item.quantity}` 
                });
            }

            // 3. Deduct stock from the specific variant
            variant.quantity -= item.quantity;
            await product.save({ session });

            // 4. Calculate prices (applying active promotional offers)
            let itemPrice = product.price;
            if (product.offer && product.offer.discountedPrice !== undefined) {
                const now = new Date();
                const start = new Date(product.offer.startDate);
                const end = new Date(product.offer.endDate);
                if (now >= start && now <= end) {
                    itemPrice = product.offer.discountedPrice;
                }
            }

            calculatedTotal += itemPrice * item.quantity;

            orderItems.push({
                productID: product._id,
                size: requestedSize,
                colorCode: requestedColorCode,
                quantity: item.quantity,
                price: itemPrice
            });
        }

        // Calculate shipping fee
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

        // Promo code discount calculation
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

        // 5. Create Order inside the transaction
        const [newOrder] = await Order.create([{
            userID,
            items: orderItems,
            totalPrice: finalTotal,
            shippingAddress,
            paymentMethod: paymentMethod || "cash"
        }], { session });

        // 6. Clear user's Cart inside the transaction
        await Cart.findOneAndUpdate({ userID }, { items: [] }, { session });

        // Commit all changes
        await session.commitTransaction();
        session.endSession();

        // Populate order details for response payload
        await newOrder.populate([
            { path: "userID", select: "name email" },
            { path: "items.productID", select: "name imageCover" }
        ]);

        // Send order confirmation alert to customer
        const userLanguage = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
        sendOrderConfirmation(shippingAddress.phone, newOrder._id.toString(), finalTotal, userLanguage).catch((err) => {
            console.error("Notification Error:", err);
        });

        return res.status(201).json({
            message: "Order created successfully",
            data: newOrder
        });

    } catch (error: any) {
        // Abort the transaction in case of any failures
        await session.abortTransaction();
        session.endSession();
        console.error("Create Order Transaction Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};
