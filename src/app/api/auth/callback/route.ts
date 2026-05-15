// src/app/api/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // นำเข้า prisma มาด้วย

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
     
      // อัปเดต เเละเเทรกบันทึกข้อมูลแบบอเนกประสงค์
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email!,
          name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "User",
        },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "User",
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // ถ้า error หรือไม่มี code ให้กลับไปหน้า login
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}