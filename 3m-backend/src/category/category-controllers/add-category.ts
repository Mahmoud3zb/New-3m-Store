// import { RequestHandler } from "express";
// import { Category } from "../category-model";

// interface IRequest {
//     name: string;
//     description: string;
//     isActive?: boolean;
// }
// interface IResponse {
//     message: string;
//     data?: any;
// }


// export const addCategory:RequestHandler<{}, IResponse, IRequest> = async (req, res) => {    
//     try {
//         const category = await Category.create(req.body);
//         return res.status(201).json({
//             message: "Category created successfully",
//             data: category
//         })
//     }catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

import { RequestHandler } from "express";
import { Category } from "../category-model";

interface IRequest {
    name: string;
    description: string;
    isActive?: boolean;
}

interface IResponse {
    message: string;
    data?: any;
}

export const addCategory: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {    
    try {
        const { name, description, isActive } = req.body;

        const userId = req.user!.id; 
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Admin ID not found" });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ 
                message: "Category name already exists" 
            });
        }

        const category = await Category.create({
            name,
            description,
            isActive: isActive ?? true,
            userID: userId
        });

        return res.status(201).json({
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.error("Add Category Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};