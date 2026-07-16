import mongoose from "mongoose";

export enum Role {
    User = "user",
    Admin = "admin",
}

// Predefined granular admin permissions
export enum Permission {
    CanAddProducts = "can_add_products",
    CanViewOrders = "can_view_orders",
    CanManageCoupons = "can_manage_coupons",
    CanViewAnalytics = "can_view_analytics",
}

export interface IAddress {
    street: string;
    city: string;
    country: string;
}

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    address: IAddress;
    profileImage?: string;
    isVerified: boolean;
    role: Role;
    permissions: Permission[]; // Added: Granular permissions array
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    wishlist?: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.User
    },
    permissions: {
        type: [String],
        enum: Object.values(Permission),
        default: [] // For regular users, this is empty
    },
    profileImage: {
        type: String,
        default: "https://default-avatar-url.com/avatar.png" 
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>("User", UserSchema);
