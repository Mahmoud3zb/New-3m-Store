import { body } from "express-validator";

export const productValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required"),
    body("images")
        .optional()
        .isArray().withMessage("Images must be an array"),
    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ min: 1 }).withMessage("Price must be at least 1"),
    body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 0 }).withMessage("Quantity must be a number"),
    body("categoryID")
        .notEmpty().withMessage("Category ID is required")
        .isMongoId().withMessage("Invalid Category ID format"),
]
