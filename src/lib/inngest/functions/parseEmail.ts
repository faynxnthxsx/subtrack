import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";

export const parseEmailFunction = inngest.createFunction(
  {
    id: "parse-email",
    name: "Parse Email with Gemini AI",
    retries: 3,
    trigger: { event: "email/received" },
  } as any,
  async ({ event }: { event: any }) => {
    try {
      const { rawEmailId } = event.data;

      // บันทึกสถานะไว้ใน DB เพื่อให้รู้ว่าระบบได้รับ Email แล้วแต่ยังไม่ประมวลผลด้วย AI
      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { 
          parseStatus: "FAILED", 
          parseError: "AI feature coming soon" 
        },
      });

      return { success: false, reason: "AI feature coming soon" };
    } catch (error) {
      console.error("[INNGEST_PARSE_EMAIL_ERROR]:", error);
      // ไม่ต้องโยน Error ต่อ (Throw) เพราะเราต้องการให้ Job นี้จบแบบเงียบๆ
      return { success: false, error: "Internal error during skip" };
    }
  }
);