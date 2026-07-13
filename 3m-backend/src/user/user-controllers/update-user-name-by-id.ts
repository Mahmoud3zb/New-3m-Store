import { RequestHandler } from "express";
import { IUser, User } from "../user-model";

import mongoose from "mongoose";

interface IRequest {
    name: string
}
interface IResponse {
    message: string,
    data?: IUser
}
export const updateUserNameById: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }
        const user = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name
        }, { new: true }).select("-password").lean();
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
