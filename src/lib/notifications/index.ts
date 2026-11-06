import { prisma } from "@/lib/db/prisma";

export type NotificationType =
  | "RFQ_MATCH"
  | "QUOTE_RECEIVED"
  | "QUOTE_ACCEPTED"
  | "ORDER_STATUS"
  | "NEW_MESSAGE"
  | "SYSTEM";

export interface SendNotificationParams {
  userId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  titleAr: string;
  bodyAr: string;
  link?: string;
  data?: Record<string, string | number>;
}

// WhatsApp Template Builder
export class WhatsAppAdapter {
  static formatMessage(type: NotificationType, data: Record<string, string | number> = {}): string {
    switch (type) {
      case "RFQ_MATCH":
        return `مرحباً بك من منصة TexLink Egypt 🧶
يوجد طلب تصنيع (RFQ) جديد يطابق تخصص مصنعك:
• الموديل: ${data.productType || "ملابس وتريكو"}
• الكمية: ${data.quantity || 100} قطعة
• الرابط المباشر: ${data.url || "https://texlink-egypt.com"}
بادر بتقديم عرض سعرك المناسب للمشتري.`;

      case "QUOTE_RECEIVED":
        return `مرحباً بك من TexLink Egypt 📬
تم استلام عرض سعر جديد على طلبك: "${data.rfqTitle || "طلب تصنيع"}"
• مقدم العرض: ${data.factoryName || "مصنع معتمد"}
• السعر للقطعة: ${data.unitPrice || 0} ج.م
• القيمة الإجمالية: ${data.totalAmount || 0} ج.م
لمقارنة العروض وقبول الأنسب:
${data.url || "https://texlink-egypt.com"}`;

      case "QUOTE_ACCEPTED":
        return `🎉 مبروك من منصة TexLink Egypt!
تم اعتماد وقبول عرض سعرك رسمياً!
• رقم أمر التصنيع: #${data.orderNumber || ""}
• القيمة الإجمالية: ${data.totalAmount || 0} ج.م
تم فتح بيانات التواصل المباشر مع المشتري للتنسيق وبدء التشغيل:
${data.url || "https://texlink-egypt.com"}`;

      case "ORDER_STATUS":
        return `تحديث حالة الطلب من TexLink Egypt 📦
أمر التصنيع رقم #${data.orderNumber || ""}:
تم تحديث المرحلة إلى: "${data.stepTitle || "قيد التنفيذ"}"
لمتابعة التفاصيل والجدول الزمني:
${data.url || "https://texlink-egypt.com"}`;

      case "NEW_MESSAGE":
        return `رسالة جديدة من TexLink Egypt 💬
لديك رسالة جديدة بخصوص الطلب #${data.orderNumber || data.rfqTitle || ""}:
"${data.preview || "انقر للمعاينة"}"
للرد مباشرة: ${data.url || "https://texlink-egypt.com"}`;

      default:
        return `إشعار من منصة TexLink Egypt: ${data.body || ""}`;
    }
  }

  static createWaMeLink(phone: string, message: string): string {
    // Clean phone number: remove non-digits
    const cleanPhone = phone.replace(/\D/g, "");
    // Ensure Egypt prefix 20
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("01")) {
      formattedPhone = "2" + formattedPhone;
    } else if (!formattedPhone.startsWith("20") && formattedPhone.length === 10) {
      formattedPhone = "20" + formattedPhone;
    }

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
}

// Resend Email Adapter
export class EmailAdapter {
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<{ success: boolean }> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey === "re_mock_test_key") {
      // Mock email delivery for dev & testing
      console.log(`[EmailAdapter Mock] Sending to ${to}: ${subject}`);
      return { success: true };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TexLink Egypt <notifications@texlink-egypt.com>",
          to: [to],
          subject,
          html: htmlContent,
        }),
      });
      return { success: res.ok };
    } catch (err) {
      console.error("[EmailAdapter] Failed to send via Resend:", err);
      return { success: false };
    }
  }
}

// Unified Notification Service
export class NotificationService {
  static async notify(params: SendNotificationParams): Promise<{
    inAppId: string;
    waLink?: string;
  }> {
    // 1. In-App Notification (Always stored)
    const inApp = await prisma.notification.create({
      data: {
        userId: params.userId,
        titleAr: params.titleAr,
        bodyAr: params.bodyAr,
        type: params.type,
        link: params.link,
      },
    });

    // 2. WhatsApp Notification Template & Link
    let waLink: string | undefined;
    if (params.recipientPhone) {
      const templateData: Record<string, string | number> = {
        ...(params.data || {}),
        body: params.bodyAr,
      };
      if (params.link) {
        templateData.url = `${process.env.NEXT_PUBLIC_APP_URL || "https://texlink-egypt.com"}${params.link}`;
      }

      const waText = WhatsAppAdapter.formatMessage(params.type, templateData);
      waLink = WhatsAppAdapter.createWaMeLink(params.recipientPhone, waText);
    }

    // 3. Email Notification
    if (params.recipientEmail) {
      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc;">
          <h2 style="color: #542cb7;">TexLink Egypt - إشعار جديد</h2>
          <h3 style="color: #0b1320;">${params.titleAr}</h3>
          <p style="font-size: 15px; line-height: 1.6;">${params.bodyAr}</p>
          ${
            params.link
              ? `<a href="${process.env.NEXT_PUBLIC_APP_URL || "https://texlink-egypt.com"}${params.link}" style="display: inline-block; background: #542cb7; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">عرض التفاصيل في المنصة</a>`
              : ""
          }
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 25px;" />
          <p style="font-size: 12px; color: #64748b;">منصة ربط مصانع التريكو في مصر بالمشترين.</p>
        </div>
      `;
      // Run email asynchronously
      EmailAdapter.sendEmail(params.recipientEmail, params.titleAr, emailHtml).catch(
        (err) => console.error("Email send error:", err)
      );
    }

    return {
      inAppId: inApp.id,
      waLink,
    };
  }
}
