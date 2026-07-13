import { RequestHandler } from "express";
import { Settings } from "../settings/settings-model";
import jwt from "jsonwebtoken";
import { UserToken } from "../interfaces/user-token";

export const checkMaintenance: RequestHandler = async (req, res, next) => {
    try {
        const path = req.path;
        
        
        if (path.startsWith("/settings") || path.startsWith("/auth")) {
            return next();
        }

        const settings = await Settings.findOne();
        if (settings && settings.maintenanceMode) {
            const { token } = req.cookies;
            if (token) {
                try {
                    const decoded = <UserToken>jwt.verify(token, process.env.secretKey!);
                    if (decoded.role === "admin") {
                        return next(); 
                    }
                } catch (err) {
                    
                }
            }
            return res.status(503).json({
                message: "Store is currently under maintenance",
                maintenance: true
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};
