import { RequestHandler } from "express";
import { Category } from "../category-model";
import mongoose from "mongoose";



export const deleteCategory: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid category id format" });
        }
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}