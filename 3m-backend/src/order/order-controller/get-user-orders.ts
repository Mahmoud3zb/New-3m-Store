import { RequestHandler } from "express";
import { Order } from "../order-model";


export const getUserOrders:RequestHandler=async(req,res)=>{
try{
    const userId=req.user!.id
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const orders=await Order.find({userID:userId}).populate("userID","name email")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({createdAt:-1})
        .populate("items.productID", "name imageCover")
        .lean();
        const total=await Order.countDocuments({userID:userId});
    return res.status(200).json({
        message:"Orders fetched successfully",
        page,
        limit,
        total,
        data:orders
    })
}catch(error){
    console.error(error);
    return res.status(500).json({message:"Internal server error"});
}
}