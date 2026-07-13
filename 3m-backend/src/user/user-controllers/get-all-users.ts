// for admin
import { RequestHandler } from "express";
import { User } from "../user-model";


export const getAllUsers: RequestHandler = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const users = await User.find()
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await User.countDocuments();

        return res.status(200).json({
            message: "Users fetched successfully",
            page,
            limit,
            total,
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};