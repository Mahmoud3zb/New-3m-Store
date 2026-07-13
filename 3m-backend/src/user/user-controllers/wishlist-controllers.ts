import { RequestHandler } from "express";
import mongoose from "mongoose";
import { User } from "../user-model";

export const getWishlist: RequestHandler = async (req, res) => {
    try {
        const userID = req.user!.id;
        const user = await User.findById(userID).populate("wishlist", "name price description imageCover");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "Wishlist retrieved successfully",
            data: user.wishlist || []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addToWishlist: RequestHandler = async (req, res) => {
    try {
        const userID = req.user!.id;
        const productID = req.body.productID as string;

        if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const isExist = user.wishlist?.some(id => id.toString() === productID);
        if (!isExist) {
            user.wishlist = user.wishlist || [];
            user.wishlist.push(new mongoose.Types.ObjectId(productID));
            await user.save();
        }

        return res.status(200).json({
            message: "Product added to wishlist successfully",
            data: user.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFromWishlist: RequestHandler = async (req, res) => {
    try {
        const userID = req.user!.id;
        const productID = req.params.productID as string;

        if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.wishlist) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productID);
            await user.save();
        }

        return res.status(200).json({
            message: "Product removed from wishlist successfully",
            data: user.wishlist || []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
