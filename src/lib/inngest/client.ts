// src/lib/inngest/client.ts
// Inngest client — ใช้ส่ง event และ register functions

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "subtrack",
  name: "SubTrack",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
// ===========================
// Event Types
// กำหนด type ของ event ทั้งหมดที่ใช้ใน app
// ===========================
export type Events = {
  // เมื่อได้รับ email จาก Postmark
  "email/received": {
    data: {
      rawEmailId: string;
      userId: string;
      subject: string;
      bodyText: string;
      bodyHtml?: string;
    };
  };
  // เมื่อต้องการส่ง reminder
  "subscription/reminder": {
    data: {
      userId: string;
      subscriptionId: string;
    };
  };
};