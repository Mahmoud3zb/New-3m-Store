import { RequestHandler } from "express";
import Stripe from "stripe";
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-06-24.dahlia",
});

interface IPaymentRequest {
    totalAmount: number; 
    orderId?: string;
}

export const createPaymentIntent: RequestHandler<{}, {}, IPaymentRequest> = async (req, res) => {
    try {
        const { totalAmount, orderId } = req.body;

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const amountInCents = Math.round(totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "egp",
            metadata: {
                userId: req.user?.id || "guest",
                orderId: orderId || "",
            },
        });
        return res.status(200).json({
            message: "Payment Intent created successfully",
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error: any) {
        console.error("Stripe Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};