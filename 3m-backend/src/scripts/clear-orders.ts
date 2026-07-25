import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../order/order-model";
import { Cart } from "../cart/cart-model";

dotenv.config();

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME || "m-commerce";

if (!DB_URL) {
    console.error("DB_URL is not defined in environment variables!");
    process.exit(1);
}

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(DB_URL!, { dbName: DB_NAME });
        console.log("Connected successfully.");

        console.log("Clearing Orders collection...");
        const orderResult = await Order.deleteMany({});
        console.log(`Deleted ${orderResult.deletedCount} orders.`);

        console.log("Clearing Carts collection...");
        const cartResult = await Cart.deleteMany({});
        console.log(`Deleted ${cartResult.deletedCount} carts.`);

        console.log("Database reset completed successfully!");
    } catch (error) {
        console.error("Reset failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
