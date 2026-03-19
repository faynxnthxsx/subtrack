// src/lib/gemini.ts
// Gemini AI client สำหรับ extract ข้อมูลจาก email ใบเสร็จ

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parsedEmailSchema } from "@/lib/validations";
import type { ParsedEmailData } from "@/lib/validations";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ===========================
// Extract ข้อมูลจาก email
// ===========================
export async function extractEmailData(
  subject: string,
  body: string
): Promise<ParsedEmailData | null> {
  try {
   const model = genAI.getGenerativeModel({ model:  "gemini-pro-vision"});

    const prompt = `
You are a receipt/invoice data extractor. Extract subscription billing information from the following email.

Email Subject: ${subject}
Email Body: ${body}

Extract and return ONLY a JSON object with these fields (no markdown, no explanation):
{
  "serviceName": "name of the service/app (e.g. Netflix, Spotify)",
  "amount": 0.00,
  "currency": "THB or USD or etc",
  "billingDate": "YYYY-MM-DD format of the billing date",
  "category": "one of: ENTERTAINMENT, PRODUCTIVITY, DEVELOPER, DESIGN, MUSIC, GAMING, CLOUD, FINANCE, HEALTH, OTHER",
  "confidence": 0.0 to 1.0
}

If you cannot extract the information confidently, set confidence below 0.5.
Return ONLY the JSON object, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // ทำความสะอาด response จาก Gemini
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate ด้วย Zod ก่อนใช้งาน
    const validated = parsedEmailSchema.parse(parsed);
    return validated;

  } catch (error) {
    console.error("Gemini extraction error:", error);
    return null;
  }
}