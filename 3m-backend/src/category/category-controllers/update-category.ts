import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Category } from "../category-model";


interface IRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}
interface IResponse {
    message: string;
    data?: any;
}


export const updateCategory: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid category id format"
            });
        }
        let { name, description, isActive } = req.body;
        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, 
            { 
                new: true,
                runValidators: true
            }
        ).exec();
        if (!updatedCategory) {
            return res.status(404).json({
                message: "category not found"
            });
        }
        
        return res.status(200).json({
            message: "category updated successfully",
            data: updatedCategory
        })
    } catch (error) {
        if ((error as any).code === 11000) {
            return res.status(400).json({ 
                message: "Category name already exists" 
            });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}