import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { User, Role } from "../user/user-model";
import { jwtService } from "../services/jwt-service";
import { COOKIE_OPTIONS } from "./login";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin: RequestHandler = async (req, res) => {
    try {
        const { token: googleToken } = req.body;

        if (!googleToken) {
            return res.status(400).json({ message: "Google token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google token payload" });
        }

        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString("hex");
            user = await User.create({
                name: name || "Google User",
                email: email,
                password: randomPassword,
                role: Role.User 
            });
        }

        const token = jwtService.createToken(
            { id: user._id, email: user.email, role: user.role }, 
            { expiresIn: "2h" }
        );

        const refreshToken = jwtService.createToken(
            { id: user._id, email: user.email, role: user.role },
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            ...COOKIE_OPTIONS,
            maxAge: 2 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        return res.status(200).json({
            message: "Logged in successfully with Google",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({ message: "Internal server error during Google login" });
    }
};