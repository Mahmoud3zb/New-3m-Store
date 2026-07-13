import { body } from "express-validator";

export const categoryValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required"),
    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean"),
]
