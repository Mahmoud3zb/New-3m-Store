import { RequestHandler } from "express";
import { Promo } from "./promo-model";


export const createPromo: RequestHandler = async (req, res) => {
    try {
        const { code, discountType, discountValue, isActive } = req.body;
        if (!code || !discountValue) {
            return res.status(400).json({ message: "Code and discount value are required" });
        }

        const normalizedCode = code.trim().toUpperCase();
        const existingPromo = await Promo.findOne({ code: normalizedCode });
        if (existingPromo) {
            return res.status(400).json({ message: "Promo code already exists" });
        }

        const newPromo = await Promo.create({
            code: normalizedCode,
            discountType: discountType || "percentage",
            discountValue,
            isActive: isActive !== undefined ? isActive : true
        });

        return res.status(201).json({
            message: "Promo code created successfully",
            data: newPromo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllPromos: RequestHandler = async (req, res) => {
    try {
        const promos = await Promo.find().sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Promo codes fetched successfully",
            data: promos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deletePromo: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Promo.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Promo code not found" });
        }
        return res.status(200).json({
            message: "Promo code deleted successfully",
            data: deleted
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getActivePromos: RequestHandler = async (req, res) => {
    try {
        const activePromos = await Promo.find({ isActive: true });
        return res.status(200).json({
            message: "Active promo codes fetched successfully",
            data: activePromos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const validatePromoCode: RequestHandler = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Promo code is required" });
        }

        const normalizedCode = code.trim().toUpperCase();
        const promo = await Promo.findOne({ code: normalizedCode, isActive: true });
        if (!promo) {
            return res.status(400).json({ message: "Invalid or expired promo code" });
        }

        return res.status(200).json({
            message: "Promo code is valid",
            data: {
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
