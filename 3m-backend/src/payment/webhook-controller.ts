import { RequestHandler } from "express";
import Stripe from "stripe";
import dotenv from 'dotenv';
import { Order } from "../order/order-model";
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-05-27.dahlia" as any,
});

export const stripeWebhook: RequestHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as any;
            console.log(`💰 Payment succeeded for amount: ${paymentIntent.amount / 100} EGP`);
            const orderId = paymentIntent.metadata.orderId;
            await Order.findByIdAndUpdate(orderId, {
                isPaid: true,
                paidAt: new Date(),
                paymentResult: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                }
            });
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed.');
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send().end();
};