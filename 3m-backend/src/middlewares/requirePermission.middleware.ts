import { RequestHandler } from "express";
import { User, Permission } from "../user/user-model";

/**
 * Scalable middleware to require a specific permission for admin routes.
 * Must be placed after the `isAuthenticated` middleware.
 */
export const requirePermission = (requiredPermission: Permission): RequestHandler => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Fetch the user from the database to verify active permissions
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Admin checks: user must be an admin and possess the required permission
            if (user.role === "admin" && user.permissions.includes(requiredPermission)) {
                return next();
            }

            return res.status(403).json({
                message: `Forbidden: You do not have the required permission (${requiredPermission})`
            });
        } catch (error) {
            console.error("Permission Middleware Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};
