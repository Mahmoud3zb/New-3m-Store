import { RequestHandler } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../user/user-model";
import { sendEmail } from "../services/email-service";
export const forgotPassword: RequestHandler = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email address" });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); 
        await user.save();
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`; 

        const message = `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes only.`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                html: message,
            });

            return res.status(200).json({ message: "Reset link sent to your email successfully" });
        } catch (mailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            
            return res.status(500).json({ message: "Error sending the email. Try again later." });
        }

    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

