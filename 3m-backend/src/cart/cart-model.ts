import mongoose from "mongoose";

interface Iitem {
    productID: mongoose.Types.ObjectId;
    quantity: number;
}
interface ICart extends mongoose.Document {
    userID: mongoose.Types.ObjectId;
    items: Iitem[];
}
const cartSchema = new mongoose.Schema<ICart>({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: {
            type: [
                {
                    productID: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: [1, "Quantity must be at least 1"]
                    },
                }
            ],
            default: []
        },
},
    {
        timestamps: true
    }
)

export const Cart = mongoose.model<ICart>("Cart", cartSchema);