
import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { createPaymentIntent } from "./payment-controller";
import { stripeWebhook } from "./webhook-controller";
import express from "express";
const router = Router();

router.post('/create-intent', isAuthenticated, createPaymentIntent);

export default router