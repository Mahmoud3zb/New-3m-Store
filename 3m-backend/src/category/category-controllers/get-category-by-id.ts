import { RequestHandler } from "express";
import { Category } from "../category-model";
import mongoose from "mongoose";




export const getCategoryById:RequestHandler<{id:string}>=async(req,res)=>{
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid category id format"});
        }
        const category=await Category.findById(req.params.id).lean();
        if(!category){
            return res.status(404).json({message:"Category not found"});
        }
        return res.status(200).json({
            message:"Category fetched successfully",
            data:category
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}