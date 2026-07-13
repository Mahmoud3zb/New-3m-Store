import mongoose from "mongoose";

interface IReview extends mongoose.Document {
    userID: mongoose.Types.ObjectId;
    productID: mongoose.Types.ObjectId;
    rate: number;
    comment: string;
}

const ReviewSchema = new mongoose.Schema<IReview>({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rate: {
        type: Number,
        required: true,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot be more than 5"]
    },
    comment: {
        type: String,
    }
}, {
    timestamps: true
});
ReviewSchema.index({ userID: 1, productID: 1 }, { unique: true });
export const Review = mongoose.model<IReview>("Review", ReviewSchema);