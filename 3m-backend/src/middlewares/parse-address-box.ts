import { RequestHandler } from "express";

export const parseAddressBox: RequestHandler = (req, res, next) => {
    if (req.body.address && typeof req.body.address === "string") {
        try {
            req.body.address = JSON.parse(req.body.address);
        } catch (error) {
            return res.status(400).json({ message: "Invalid address format" });
        }
    }
    next();
};