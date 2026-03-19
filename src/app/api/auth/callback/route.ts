// src/app/api/auth/callback/route.ts
// รับ callback จาก Supabase หลัง OAuth (Google) สำเร็จ
// แล้ว redirect ไป dashboard

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // ถ้า error → ไปหน้า login พร้อม error message
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}