import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionSchema } from "@/lib/validations";

// Helper: ตรวจสอบและสร้าง User ใน Neon Database
async function ensureUser(user: any) {
  return await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email!,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
    },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
    },
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // [FIX]: ต้องรัน ensureUser เพื่อป้องกัน Record ใน Neon หาย ซึ่งเป็นเหตุผลของ 500 Error
    await ensureUser(user);

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
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
    console.error("[SUBS_GET_API_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureUser(user);

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    const subscription = await prisma.subscription.create({
      data: {
        ...validated,
        userId: user.id,
      },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error: any) {
    console.error("[SUBS_POST_API_ERROR]:", error);
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });

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
    console.error("[SUBS_PATCH_API_ERROR]:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}