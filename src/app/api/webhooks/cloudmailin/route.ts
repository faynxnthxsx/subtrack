// src/app/api/webhooks/cloudmailin/route.ts
// รับ webhook จาก Cloudmailin เมื่อมี email เข้ามา
// แล้ว trigger Inngest function ให้ AI ประมวลผล

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: Request) {
  try {
    // ===========================
    // 1. ตรวจสอบ Basic Auth
    // ===========================
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const base64 = authHeader.replace("Basic ", "");
      const decoded = Buffer.from(base64, "base64").toString();
      const [username, password] = decoded.split(":");

      if (
        username !== process.env.CLOUDMAILIN_USERNAME ||
        password !== process.env.CLOUDMAILIN_PASSWORD
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // ===========================
    // 2. Parse email payload จาก Cloudmailin
    // ===========================
    const body = await request.json();

    const fromEmail = body.envelope?.from ?? body.headers?.from ?? "";
    const subject = body.headers?.subject ?? "No Subject";
    const bodyText = body.plain ?? "";
    const bodyHtml = body.html ?? "";
    const toEmail = body.envelope?.to ?? "";

    // ===========================
    // 3. หา userId จาก inbound email address
    // ชื่อ format: parse+{userId}@cloudmailin.net
    // ===========================
    // สำหรับตอนนี้ใช้วิธีง่ายๆ คือ
    // หา user จาก email ที่ส่งมา (fromEmail)
    const user = await prisma.user.findUnique({
      where: { email: fromEmail },
    });

    if (!user) {
      // ถ้าไม่เจอ user → ยังบันทึกไว้แต่ไม่ process
      console.log(`Unknown sender: ${fromEmail}`);
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }

    // ===========================
    // 4. บันทึก raw email ลง DB
    // ===========================
    const rawEmail = await prisma.rawEmail.create({
      data: {
        userId: user.id,
        fromEmail,
        subject,
        bodyText,
        bodyHtml,
        parseStatus: "PENDING",
      },
    });

    // ===========================
    // 5. Trigger Inngest function
    // ===========================
    await inngest.send({
      name: "email/received",
      data: {
        rawEmailId: rawEmail.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Cloudmailin webhook error:", error);
    // ต้อง return 200 เสมอ ไม่งั้น Cloudmailin จะ retry
    return NextResponse.json({ message: "ok" }, { status: 200 });
  }
}