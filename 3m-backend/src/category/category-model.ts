import mongoose from "mongoose";

interface ICategory extends mongoose.Document {
    userID: mongoose.Types.ObjectId;
    name: string;
    description: string;
    isActive: boolean;
}


const categorySchema = new mongoose.Schema<ICategory>({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{timestamps: true});

export const Category = mongoose.model<ICategory>("Category", categorySchema);