import { RequestHandler } from "express";
import { User } from "../user-model";

export const updateProfileImage: RequestHandler = async (req, res) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const profileImage = req.file?.path;
        if (!profileImage) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { profileImage },
            { new: true }
        ).select("-password").lean();

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile image updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Update Profile Image Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
