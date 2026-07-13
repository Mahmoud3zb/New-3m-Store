// for admin
import { RequestHandler } from "express";
import { User } from "../user-model";
import mongoose from "mongoose";


export const getUserById: RequestHandler<{id:string}> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }
        const user = await User.findById(req.params.id)
            .select("-password")
            .lean();
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User fetched successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
