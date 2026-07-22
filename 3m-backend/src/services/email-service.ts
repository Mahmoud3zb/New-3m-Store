import fs from "fs/promises";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER,
        ...options,
    };
    const info = await transporter.sendMail(mailOptions);

    console.log("email sent to ", info.accepted);
}

async function sendEmailVerificationLink(email: string, token: string) {
    const url = `http://localhost:3000/api/auth/verify/${email}/${token}`;

    let emailTemplate = await fs.readFile(
        // "./src/templates/email.template.html",
        "./src/services/templates/register.html",
        "utf-8"
    );

    emailTemplate = emailTemplate.replace("{url}", url);

    await sendEmail({
        to: email,
        subject: "Email verification",
        html: emailTemplate,
    });
}
async function sendGoogleWelcomeEmail(email: string, name: string) {
    let emailTemplate = await fs.readFile(
        "./src/services/templates/continue-W-google.html",
        "utf-8"
    );

    emailTemplate = emailTemplate.replace("{name}", name);

    await sendEmail({
        to: email,
        subject: "Welcome to M-commerce 👋",
        html: emailTemplate,
    });
}

async function sendNewOrderAdminAlert(order: any) {
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) return;

    const itemsHtml = order.items.map((item: any) => `
        <li>
            <strong>${item.productID?.name || "Product"}</strong> (Qty: ${item.quantity}, Size: ${item.size}, Color: ${item.colorCode}) - ${item.price} EGP
        </li>
    `).join("");

    const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #111;">
            <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">🛍️ طلب جديد تم تسجيله على المتجر!</h2>
            <p>مرحباً يا مسؤول، تم تسجيل طلب جديد بنجاح وتفاصيله كالتالي:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9; width: 150px;">رقم الطلب</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">#${order._id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">العميل</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.userID?.name || "غير معروف"} (${order.userID?.email || ""})</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">رقم الهاتف</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingAddress?.phone || "غير محدد"}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">العنوان بالتفصيل</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingAddress?.city || ""}، ${order.shippingAddress?.street || ""}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">طريقة الدفع</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.paymentMethod === 'cash' ? 'الدفع عند الاستلام (COD)' : 'الدفع بالبطاقة'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">إجمالي المبلغ</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #e53e3e;">${order.totalPrice} EGP</td>
                </tr>
            </table>

            <h3 style="margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">📦 المنتجات المطلوبة</h3>
            <ul>
                ${itemsHtml}
            </ul>

            <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">الانتقال إلى لوحة التحكم</a>
            </div>
        </div>
    `;

    try {
        await sendEmail({
            to: adminEmail,
            subject: `🚨 طلب جديد رقم #${order._id} - متجر 3M`,
            html: emailBody,
        });
    } catch (err) {
        console.error("Failed to send order email alert to admin:", err);
    }
}

async function sendNewOrderCustomerAlert(order: any) {
    const customerEmail = order.userID?.email;
    if (!customerEmail) return;

    const itemsHtml = order.items.map((item: any) => `
        <li>
            <strong>${item.productID?.name || "Product"}</strong> (الكمية: ${item.quantity}، المقاس: ${item.size}، اللون: ${item.colorCode}) - ${item.price} EGP
        </li>
    `).join("");

    const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #111; direction: rtl; text-align: right;">
            <h2 style="color: #2b6cb0; border-bottom: 2px solid #eee; padding-bottom: 10px;">🛍️ شكراً لتسوقك من متجر 3M!</h2>
            <p>مرحباً ${order.userID?.name || ""}، تم تسجيل طلبك بنجاح وجاري العمل على تجهيزه وشحنه. إليك تفاصيل طلبك:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9; width: 150px;">رقم الطلب</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">#${order._id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">عنوان الشحن</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingAddress?.city || ""}، ${order.shippingAddress?.street || ""}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">رقم الاتصال</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingAddress?.phone || ""}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">طريقة الدفع</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.paymentMethod === 'cash' ? 'الدفع عند الاستلام (COD)' : 'الدفع بالبطاقة'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">إجمالي الفاتورة</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2b6cb0;">${order.totalPrice} EGP</td>
                </tr>
            </table>

            <h3 style="margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">📦 تفاصيل المنتجات</h3>
            <ul>
                ${itemsHtml}
            </ul>

            <p style="margin-top: 30px; font-weight: bold;">يمكنك تأكيد طلبك فوراً مجاناً لتسريع عملية الشحن بالضغط على زر الواتساب التالي:</p>
            <div style="margin-top: 15px; text-align: center;">
                <a href="https://wa.me/201006488707?text=${encodeURIComponent(`مرحباً، أود تأكيد طلبي رقم #${order._id} بقيمة ${order.totalPrice} EGP.`)}" style="background: #25D366; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تأكيد عبر الواتساب (مجاناً)</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 11px; color: #777;">* إذا كان لديك أي استفسار، لا تتردد بالرد على هذا الإيميل أو التواصل معنا مباشرة عبر رقم الواتساب.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: customerEmail,
            subject: `🛍️ تأكيد طلبك رقم #${order._id} - متجر 3M`,
            html: emailBody,
        });
    } catch (err) {
        console.error("Failed to send order email alert to customer:", err);
    }
}

export const emailService = {
    sendEmail,
    sendEmailVerificationLink,
    sendGoogleWelcomeEmail,
    sendNewOrderAdminAlert,
    sendNewOrderCustomerAlert
};
