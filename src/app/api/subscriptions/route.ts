// src/app/api/subscriptions/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionSchema } from "@/lib/validations";

/**
 * Helper: ตรวจสอบและสร้าง User ใน Neon Database
 * ปรับปรุง: ใช้ Metadata ที่กว้างขึ้นเพื่อลดปัญหาชื่อเป็น undefined
 */
async function ensureUser(user: any) {
  try {
    return await prisma.user.upsert({
      where: { id: user.id },
      update: {
        // อัปเดตอีเมล/ชื่อ เผื่อมีการเปลี่ยนแปลงจากฝั่ง Google
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
      },
    });
  } catch (error) {
    console.error("[ENSURE_USER_ERROR]:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ในฐานะ Dev: เราจะไม่ ensureUser ทุกครั้งที่ GET เพื่อประหยัด Resource
    // เพราะ User จะต้องถูกสร้างตั้งแต่ตอน Login หรือตอนกดเพิ่ม (POST) อยู่แล้ว
    
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id }, // <--- หัวใจสำคัญ: ล็อกให้เห็นเฉพาะของตัวเอง
      include: { 
        bills: { 
          orderBy: { billingDate: "desc" }, 
          take: 1 
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error) {
    // พ่น Error ออก Console ของ Vercel เสมอ จะได้รู้ว่าทำไมระบบถึงล่ม
    console.error("[SUBS_GET_API_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ตรวจสอบว่ามี User ใน DB หรือยังก่อนจะสร้าง Subscription
    await ensureUser(user);

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    const subscription = await prisma.subscription.create({
      data: {
        ...validated,
        userId: user.id, // <--- ผูกข้อมูลเข้ากับ User ที่ล็อกอินอยู่
      },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error: any) {
    console.error("[SUBS_POST_API_ERROR]:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}