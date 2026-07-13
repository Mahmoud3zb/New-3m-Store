import mongoose from "mongoose";

export interface IPromo extends mongoose.Document {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    isActive: boolean;
}

const promoSchema = new mongoose.Schema<IPromo>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Promo = mongoose.model<IPromo>("Promo", promoSchema);
