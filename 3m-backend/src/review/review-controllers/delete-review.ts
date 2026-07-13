import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Review } from "../review-model";


export const deleteReview:RequestHandler<{reviewID:string}> = async(req,res)=>{
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.reviewID)){
            return res.status(400).json({message:"Invalid review id format"});
        }
        const review=await Review.findById(req.params.reviewID).lean();
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if(req.user!.role==="admin" ||  review!.userID.toString()===req.user!.id){
            await Review.findByIdAndDelete(req.params.reviewID);
            return res.status(200).json({message:"Review deleted successfully"});
        }else{
            return res.status(403).json({message:"Forbidden: You are not allowed to delete this review"});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}