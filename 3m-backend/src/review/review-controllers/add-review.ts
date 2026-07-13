import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Review } from "../review-model";
import { body } from "express-validator";

export const addReviewValidator = [
    body("rate")
        .notEmpty()
        .withMessage("Rating is required")
        .isFloat({ min: 1, max: 5 })
        .withMessage("Rating must be a number between 1 and 5"),
    body("comment")
        .optional()
        .trim()
        .isString()
        .withMessage("Comment must be a text")
];

interface IRequest {
    rate: number;
    comment?: string;
}

export const addReview: RequestHandler<{ productID: string }, any, IRequest> = async (req, res) => {
    try {
        const { productID } = req.params;
        const userID = req.user!.id;
        const { rate, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid Product ID format" });
        }

        const review = await Review.create({ 
            userID, 
            productID, 
            rate, 
            comment 
        });

        return res.status(201).json({ 
            message: "Review created successfully", 
            data: review 
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }
        
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};