import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { updateSubscriptionSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    
    // 🔥 บังคับ Parse ข้อมูลก่อนเข้า Zod/Prisma กันพัง
    const payload = {
      ...body,
      amount: parseFloat(body.amount),
      billingDay: parseInt(body.billingDay)
    };

    const validated = updateSubscriptionSchema.parse(payload);

    const updated = await prisma.subscription.update({
      where: { id, userId: user.id },
      data: validated,
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("[PATCH_ERROR]:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.subscription.delete({
      where: { id, userId: user.id }
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}