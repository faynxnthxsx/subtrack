import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionSchema } from "@/lib/validations";

async function ensureUser(user: any) {
  return await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email!, name: user.user_metadata?.full_name ?? "User" },
    create: { id: user.id, email: user.email!, name: user.user_metadata?.full_name ?? "User" },
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureUser(user);

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { bills: { orderBy: { billingDate: "desc" }, take: 1 } },
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
      data: { ...validated, userId: user.id },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error: any) {
    console.error("[SUBS_POST_API_ERROR]:", error);
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}