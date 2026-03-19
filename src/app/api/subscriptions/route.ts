// src/app/api/subscriptions/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionSchema } from "@/lib/validations";

// helper สร้าง user ใน Neon ถ้ายังไม่มี
async function ensureUser(user: any) {
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
    },
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUser(user); // ← เพิ่มตรงนี้

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { bills: { orderBy: { billingDate: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUser(user); // ← เพิ่มตรงนี้

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
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}