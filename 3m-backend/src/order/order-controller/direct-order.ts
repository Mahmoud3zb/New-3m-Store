import { RequestHandler } from "express";
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
    shippingAddress: IShippingAddress;
    promoCode?: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const directOrder: RequestHandler<{}, IResponse, IDirectRequest> = async (req, res) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const { productID, quantity, shippingAddress, promoCode } = req.body;

        const product = await Product.findById(productID);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productPrice = product.price;
        const calculatedTotal = productPrice * quantity;

        const orderItems = [{
            productID: product._id,
            quantity,
            price: productPrice
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
            const promo = await Promo.findOne({ code: promoCode.trim().toUpperCase(), isActive: true });
            if (promo) {
                if (promo.discountType === "percentage") {
                    discount = Math.round(calculatedTotal * (promo.discountValue / 100));
                } else if (promo.discountType === "fixed") {
                    discount = Math.min(calculatedTotal, promo.discountValue);
                }
            }
        }

        const finalTotal = Math.max(0, calculatedTotal - discount + shippingFee);

        const newOrder = await Order.create({
            userID,
            items: orderItems,
            totalPrice: finalTotal,
            shippingAddress,
            paymentMethod: "cash" 
        });

        await newOrder.populate([
            { path: "userID", select: "name email" },
            { path: "items.productID", select: "name imageCover" }
        ]);

        return res.status(201).json({
            message: "Direct order created successfully",
            data: newOrder
        });

    } catch (error) {
        console.error("Direct Order Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
