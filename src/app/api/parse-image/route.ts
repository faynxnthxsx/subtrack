// src/app/api/parse-image/route.ts
// API รับรูปภาพ → ส่งให้ Gemini อ่าน → return ข้อมูลที่ extract ได้

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parsedEmailSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // แปลงรูปเป็น base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

    // ส่งให้ Gemini อ่าน
    const model = genAI.getGenerativeModel({ model:  "gemini-pro-vision" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
      `Extract billing/subscription information from this receipt or screenshot.
Return ONLY a valid JSON object with no explanation or markdown:
{
  "serviceName": "name of service",
  "amount": 0.00,
  "currency": "THB",
  "billingDate": "YYYY-MM-DD",
  "category": "ENTERTAINMENT | PRODUCTIVITY | DEVELOPER | DESIGN | MUSIC | GAMING | CLOUD | FINANCE | HEALTH | OTHER",
  "confidence": 0.0
}`,
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const validated = parsedEmailSchema.parse(parsed);

    // บันทึก RawEmail พร้อม imageUrl
    const rawEmail = await prisma.rawEmail.create({
      data: {
        userId: user.id,
        fromEmail: user.email!,
        subject: `Image upload: ${validated.serviceName}`,
        bodyText: `Extracted from image upload`,
        imageUrl: `data:${mimeType};base64,${base64.slice(0, 100)}...`,
        parseStatus: "SUCCESS",
        aiRawResponse: JSON.stringify(validated),
      },
    });

    return NextResponse.json({ data: validated, rawEmailId: rawEmail.id });
  } catch (error: any) {
    console.error("Parse image error:", error);
    return NextResponse.json({ error: "Failed to parse image" }, { status: 500 });
  }
}