import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from "./user/user-router";
import authRouter from "./auth/auth-router";
import cartRouter from "./cart/cart-router";
import productRouter from "./product/product-router";
import categoryRouter from "./category/category-router";
import reviewRouter from "./review/review-router";
import orderRouter from "./order/order-router";
import paymentRouter from "./payment/payment-router";
import promoRouter from "./promo/promo-router";
import { stripeWebhook } from "./payment/webhook-controller";
import settingsRouter from "./settings/settings-router";
import { checkMaintenance } from "./middlewares/checkMaintenance.middleware";
import rateLimit from "express-rate-limit";
import { logger } from "./services/logger";
// import { setupSwagger } from './src/swagger';

import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();
// setupSwagger(app);
const PORT = Number(process.env.PORT)|| 3000;
const URI = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
mongoose.connect(`${URI}/${DB_NAME}`)
    .then(() => logger.info("MongoDB connected successfully"))
    .catch((err) => {
        logger.error("MongoDB connection error: %O", err);

        process.exit(1);
    });

// const allowedOrigins = [
//     "http://localhost:5173",
//     process.env.FRONTEND_URL
// ].filter(Boolean) as string[];

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true
// }));

app.use(
    cors({
        origin: process.env.FRONTEND_URL ||"https://3m-store2.vercel.app",
        credentials: true,
    })
)

app.use(cookieParser());
app.use(express.static("public"));
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json());

// Define Rate Limiters
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Strict limit for sensitive actions (auth, promo validation)
    message: { message: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general api limiter
app.use("/api", apiLimiter);

app.use("/api/settings", settingsRouter);
app.use("/api", checkMaintenance);

app.use("/api/auth", sensitiveLimiter, authRouter);
app.use("/api/user", userRouter); 
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/promo", sensitiveLimiter, promoRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled Global Error: %O", err);
    res.status(500).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
});

// if(process.env.NODE_ENV === "production") {
//     const clientPath = path.resolve(__dirname, "../../Front-End/dist");

//     // Server stitic files
//     app.use(express.static(clientPath));

//     app.get(/^(?!\api).*/, (req: Request, res: Response) => {
//         res.sendFile(path.join(clientPath, "index.html"))
//     })
// }

if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api", (req, res) => {
  res.send("API is running");
});

export default app;