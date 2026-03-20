import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });
    }

    // อัปเดตพร้อมกันทั้ง 2 ที่เลย
    await Promise.all([
      supabase.auth.updateUser({
        data: { name: name.trim(), full_name: name.trim() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      }),
    ]);

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}