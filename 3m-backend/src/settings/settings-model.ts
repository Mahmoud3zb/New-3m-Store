import mongoose from "mongoose";

export interface ISettings extends mongoose.Document {
    maintenanceMode: boolean;
    announcement: {
        show: boolean;
        textAr: string;
        textEn: string;
        bgColor: string;
        textColor: string;
    };
    shippingFees: {
        cairoGiza: number;
        alexDelta: number;
        other: number;
    };
    contactInfo: {
        phone: string;
        email: string;
        facebook: string;
        instagram: string;
        whatsapp: string;
    };
    logoUrl: string;
}

const settingsSchema = new mongoose.Schema<ISettings>({
    maintenanceMode: {
        type: Boolean,
        default: false,
        required: true
    },
    announcement: {
        show: { type: Boolean, default: true, required: true },
        textAr: { type: String, default: "شحن مجاني للطلبات فوق ٢٠٠٠ جنيه!", required: true },
        textEn: { type: String, default: "Free shipping for orders over 2000 EGP!", required: true },
        bgColor: { type: String, default: "#000000", required: true },
        textColor: { type: String, default: "#ffffff", required: true }
    },
    shippingFees: {
        cairoGiza: { type: Number, default: 50, required: true },
        alexDelta: { type: Number, default: 65, required: true },
        other: { type: Number, default: 85, required: true }
    },
    contactInfo: {
        phone: { type: String, default: "01000000000", required: true },
        email: { type: String, default: "info@3mstore.com", required: true },
        facebook: { type: String, default: "https://facebook.com", required: true },
        instagram: { type: String, default: "https://instagram.com", required: true },
        whatsapp: { type: String, default: "https://wa.me/201000000000", required: true }
    },
    logoUrl: {
        type: String,
        default: "/logo.png",
        required: true
    }
}, {
    timestamps: true
});

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
