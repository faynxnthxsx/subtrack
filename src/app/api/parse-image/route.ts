// src/app/api/parse-image/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Security First: เช็คสิทธิ์ก่อนเสมอ
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * [DEV NOTE]: AI Feature Roadmap
     * 🚧 กำลังรอการเชื่อมต่อ OpenAI Vision หรือ Gemini 1.5 Flash
     * ปิดการทำงานชั่วคราวเพื่อประหยัด Quota และป้องกัน Error ในช่วง Beta
     */
    return NextResponse.json(
      { 
        message: "AI Scanner feature is coming soon!",
        status: "development" 
      }, 
      { status: 503 } // Service Unavailable (แจ้งให้ทราบว่าระบบยังไม่พร้อม)
    );

  } catch (error: any) {
    console.error("[PARSE_IMAGE_INTERNAL_ERROR]:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}