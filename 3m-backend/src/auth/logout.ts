import { RequestHandler } from "express";

export const logoutHandler: RequestHandler = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({ 
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};