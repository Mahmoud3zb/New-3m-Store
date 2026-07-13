import { RequestHandler } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../user/user-model";

export const resetPassword: RequestHandler = async (req, res) => {
    try {
        const { token } = req.params; 
        const { password } = req.body;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Invalid or missing token" });
        }
        if (!password) {
            return res.status(400).json({ message: "Please provide a new password" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save();

        return res.status(200).json({ message: "Password reset successfully! You can now log in." });

    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};