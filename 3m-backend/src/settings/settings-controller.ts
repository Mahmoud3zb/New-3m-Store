import { RequestHandler } from "express";
import { Settings } from "./settings-model";

export const getSettings: RequestHandler = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Seed a default settings document
            settings = await Settings.create({
                maintenanceMode: false,
                announcement: {
                    show: true,
                    textAr: "أهلاً بكم في متجر 3M Store - تشكيلة ملابس فريدة بخصومات حصرية!",
                    textEn: "Welcome to 3M Store - Exclusive collections with premium discounts!",
                    bgColor: "#000000",
                    textColor: "#ffffff"
                },
                shippingFees: {
                    cairoGiza: 50,
                    alexDelta: 65,
                    other: 85
                },
                contactInfo: {
                    phone: "01000000000",
                    email: "info@3mstore.com",
                    facebook: "https://facebook.com",
                    instagram: "https://instagram.com",
                    whatsapp: "https://wa.me/201000000000"
                },
                logoUrl: "/logo.png"
            });
        }
        return res.status(200).json({
            message: "Settings fetched successfully",
            data: settings
        });
    } catch (error) {
        console.error("Get Settings Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSettings: RequestHandler = async (req, res) => {
    try {
        const { maintenanceMode, announcement, shippingFees, contactInfo, logoUrl } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        if (typeof maintenanceMode !== 'undefined') settings.maintenanceMode = maintenanceMode;
        
        if (announcement) {
            if (typeof announcement.show !== 'undefined') settings.announcement.show = announcement.show;
            if (announcement.textAr) settings.announcement.textAr = announcement.textAr;
            if (announcement.textEn) settings.announcement.textEn = announcement.textEn;
            if (announcement.bgColor) settings.announcement.bgColor = announcement.bgColor;
            if (announcement.textColor) settings.announcement.textColor = announcement.textColor;
        }

        if (shippingFees) {
            if (typeof shippingFees.cairoGiza !== 'undefined') settings.shippingFees.cairoGiza = Number(shippingFees.cairoGiza);
            if (typeof shippingFees.alexDelta !== 'undefined') settings.shippingFees.alexDelta = Number(shippingFees.alexDelta);
            if (typeof shippingFees.other !== 'undefined') settings.shippingFees.other = Number(shippingFees.other);
        }

        if (contactInfo) {
            if (contactInfo.phone) settings.contactInfo.phone = contactInfo.phone;
            if (contactInfo.email) settings.contactInfo.email = contactInfo.email;
            if (contactInfo.facebook) settings.contactInfo.facebook = contactInfo.facebook;
            if (contactInfo.instagram) settings.contactInfo.instagram = contactInfo.instagram;
            if (contactInfo.whatsapp) settings.contactInfo.whatsapp = contactInfo.whatsapp;
        }

        if (logoUrl) {
            settings.logoUrl = logoUrl;
        }

        await settings.save();

        return res.status(200).json({
            message: "Settings updated successfully",
            data: settings
        });
    } catch (error) {
        console.error("Update Settings Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
