// for admin
import { RequestHandler } from "express";
import { Order } from "../order-model";


export const getAllOrders:RequestHandler = async(req,res)=>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const orders=await Order.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({createdAt:-1})
        .populate("userID", "name email")
        .populate("items.productID", "name imageCover")
        .lean();

        const total = await Order.countDocuments();
        return res.status(200).json({
            message: "Orders fetched successfully",
            page,
            limit,
            total,
            data: orders
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}