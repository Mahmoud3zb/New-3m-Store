import { RequestHandler } from "express";
import { IUser, User } from "../user-model";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

        const updateFields: any = { name: req.body.name };
        
        // If the requesting user is an Admin, allow updating role, permissions, and password
        if (req.user?.role === "admin") {
            if ((req.body as any).role) {
                updateFields.role = (req.body as any).role;
            }
            if ((req.body as any).permissions) {
                updateFields.permissions = (req.body as any).permissions;
            }
            if ((req.body as any).password) {
                updateFields.password = await bcrypt.hash((req.body as any).password, 10);
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select("-password").lean();
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
