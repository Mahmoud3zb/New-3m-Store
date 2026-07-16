import mongoose from "mongoose";

// Interface representing individual product variant stock
export interface IProductVariant {
    size: string;       // e.g., "S", "M", "L", "XL"
    colorCode: string;  // e.g., "#FF0000" or hex code
    quantity: number;   // Stock specifically for this variant
}

// Interface for promotional offers
export interface IProductOffer {
    discountedPrice: number;
    startDate: Date;
    endDate: Date;
}

export interface IProduct extends mongoose.Document {
    userID: mongoose.Types.ObjectId;
    categoryID: mongoose.Types.ObjectId;
    name: string;
    description: string;
    images: string[];
    imageCover: string;
    price: number;
    variants: IProductVariant[]; // Added: Size & Color variations
    offer?: IProductOffer;       // Added: Offer management details
}

const productSchema = new mongoose.Schema<IProduct>({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    imageCover: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [1, "Price must be at least 1"]
    },
    variants: {
        type: [
            {
                size: { type: String, required: true },
                colorCode: { type: String, required: true },
                quantity: { type: Number, required: true, min: [0, "Variant stock cannot be negative"], default: 0 }
            }
        ],
        required: true,
        validate: {
            validator: function (v: IProductVariant[]) {
                return v && v.length > 0;
            },
            message: "A product must have at least one variant."
        }
    },
    offer: {
        discountedPrice: { 
            type: Number, 
            min: [0, "Discounted price cannot be negative"],
            validate: {
                validator: function(this: any, val: number) {
                    let price = this.price;
                    if (price === undefined && typeof this.getUpdate === 'function') {
                        const update = this.getUpdate();
                        price = update.price || update.$set?.price;
                    }
                    if (price !== undefined) {
                        return val < price;
                    }
                    return true;
                },
                message: "Discounted price must be less than regular price."
            }
        },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }
    }
}, { timestamps: true });

export const Product = mongoose.model<IProduct>("Product", productSchema);
