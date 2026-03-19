// src/lib/resend.ts
// Resend client สำหรับส่ง email แจ้งเตือน

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

// ===========================
// ส่ง email แจ้งเตือนก่อนบิลตัด
// ===========================
export async function sendBillReminderEmail({
  to,
  userName,
  subscriptionName,
  amount,
  currency,
  daysLeft,
  billingDay,
}: {
  to: string;
  userName: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  daysLeft: number;
  billingDay: number;
}) {
  return resend.emails.send({
    from: "SubTrack <onboarding@resend.dev>",
    to,
    subject: `⚠️ ${subscriptionName} จะตัดเงินในอีก ${daysLeft} วัน`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">SubTrack แจ้งเตือน 🔔</h2>
        <p>สวัสดีครับคุณ <strong>${userName}</strong></p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold;">${subscriptionName}</p>
          <p style="margin: 8px 0; color: #64748b;">จะตัดเงินในอีก <strong style="color: #ef4444;">${daysLeft} วัน</strong></p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #6366f1;">
            ${currency === "THB" ? "฿" : "$"}${amount.toLocaleString()}
          </p>
          <p style="margin: 8px 0; color: #94a3b8; font-size: 14px;">วันที่ตัดรอบ: ${billingDay} ของทุกเดือน</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          จัดการ subscription ได้ที่ 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #6366f1;">SubTrack Dashboard</a>
        </p>
      </div>
    `,
  });
}

// ===========================
// ส่ง Weekly Summary
// ===========================
export async function sendWeeklySummaryEmail({
  to,
  userName,
  totalMonthly,
  subscriptionCount,
  upcomingBills,
}: {
  to: string;
  userName: string;
  totalMonthly: number;
  subscriptionCount: number;
  upcomingBills: { name: string; amount: number; daysLeft: number }[];
}) {
  const upcomingHtml = upcomingBills
    .map(
      (b) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${b.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">฿${b.amount.toLocaleString()}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: ${b.daysLeft <= 3 ? "#ef4444" : "#64748b"};">
          ${b.daysLeft} วัน
        </td>
      </tr>
    `
    )
    .join("");

  return resend.emails.send({
    from: "SubTrack <onboarding@resend.dev>",
    to,
    subject: `📊 สรุปรายจ่าย Subscription ประจำสัปดาห์`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">สรุปประจำสัปดาห์ 📊</h2>
        <p>สวัสดีครับคุณ <strong>${userName}</strong></p>

        <div style="display: flex; gap: 12px; margin: 20px 0;">
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; flex: 1;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">รายจ่ายรายเดือน</p>
            <p style="margin: 4px 0 0; font-size: 22px; font-weight: bold; color: #6366f1;">฿${totalMonthly.toLocaleString()}</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; flex: 1;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">บริการทั้งหมด</p>
            <p style="margin: 4px 0 0; font-size: 22px; font-weight: bold; color: #6366f1;">${subscriptionCount} บริการ</p>
          </div>
        </div>

        ${upcomingBills.length > 0 ? `
          <h3 style="color: #334155;">บิลที่กำลังจะถึง</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="color: #94a3b8; font-size: 12px;">
                <th style="text-align: left; padding-bottom: 8px;">บริการ</th>
                <th style="text-align: right; padding-bottom: 8px;">ราคา</th>
                <th style="text-align: right; padding-bottom: 8px;">เหลือ</th>
              </tr>
            </thead>
            <tbody>${upcomingHtml}</tbody>
          </table>
        ` : "<p style='color: #64748b;'>ไม่มีบิลที่กำลังจะถึงในสัปดาห์นี้ 🎉</p>"}

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #6366f1;">ดู Dashboard</a>
        </p>
      </div>
    `,
  });
}