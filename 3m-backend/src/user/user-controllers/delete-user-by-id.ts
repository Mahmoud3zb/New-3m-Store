import { RequestHandler } from "express";
import { User } from "../user-model";
import mongoose from "mongoose";



export const deleteUserById: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const { password: _, ...resUser } = user.toObject();
        return res.status(200).json({
            message: "User deleted successfully",
            deletedUser: resUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};