import twilio from 'twilio';

// Load environment variables dynamically
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER; // e.g. +1234567890
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. +14155238886

// Format Egyptian phone numbers to international standard +20...
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.trim().replace(/\s+/g, '');
  if (cleaned.startsWith('01')) {
    return `+20${cleaned.slice(1)}`;
  }
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}

export async function sendNotification(to: string, message: string): Promise<void> {
  const formattedTo = formatPhoneNumber(to);

  if (accountSid && authToken) {
    try {
      const client = twilio(accountSid, authToken);

      // 1. Send SMS if Twilio Phone Number is provided
      if (twilioPhone) {
        await client.messages.create({
          body: message,
          from: twilioPhone,
          to: formattedTo
        });
        console.log(`[Twilio SMS] Sent successfully to ${formattedTo}`);
      }

      // 2. Send WhatsApp if Twilio WhatsApp Number is provided
      if (twilioWhatsApp) {
        await client.messages.create({
          body: message,
          from: `whatsapp:${twilioWhatsApp}`,
          to: `whatsapp:${formattedTo}`
        });
        console.log(`[Twilio WhatsApp] Sent successfully to ${formattedTo}`);
      }
    } catch (error) {
      console.error('[Twilio Error] Failed to send notification:', error);
    }
  } else {
    // Development Mock Fallback
    console.log('\n==================================================');
    console.log('📱 [MOCK NOTIFICATION SERVICE] (No Twilio API keys)');
    console.log(`TO: ${formattedTo}`);
    console.log(`MESSAGE: \n"${message}"`);
    console.log('==================================================\n');
  }
}

export async function sendOrderConfirmation(
  phone: string,
  orderId: string,
  totalAmount: number,
  language: 'ar' | 'en' = 'ar'
): Promise<void> {
  const message = language === 'ar'
    ? `عزيزي العميل، تم تأكيد طلبك بنجاح! 🎉\nرقم الطلب: #${orderId}\nالإجمالي: ${totalAmount} ج.م.\nنشكرك على تسوقك من 3M Store!`
    : `Dear Customer, your order has been confirmed successfully! 🎉\nOrder ID: #${orderId}\nTotal: EGP ${totalAmount}\nThank you for shopping at 3M Store!`;

  await sendNotification(phone, message);
}

export async function sendOrderStatusUpdate(
  phone: string,
  orderId: string,
  newStatus: string,
  language: 'ar' | 'en' = 'ar'
): Promise<void> {
  let statusTextAr = newStatus;
  let statusTextEn = newStatus;

  switch (newStatus) {
    case 'processing':
      statusTextAr = 'قيد التحضير';
      statusTextEn = 'Processing';
      break;
    case 'shipped':
      statusTextAr = 'تم الشحن وهو في طريقه إليك 🚚';
      statusTextEn = 'Shipped and on its way to you 🚚';
      break;
    case 'delivered':
      statusTextAr = 'تم التوصيل بنجاح، نتمنى أن تنال منتجاتنا إعجابك! ❤️';
      statusTextEn = 'Delivered successfully, hope you love your products! ❤️';
      break;
  }

  const message = language === 'ar'
    ? `مرحباً، تم تحديث حالة طلبك #${orderId} إلى: ${statusTextAr}`
    : `Hello, your order #${orderId} status has been updated to: ${statusTextEn}`;

  await sendNotification(phone, message);
}
