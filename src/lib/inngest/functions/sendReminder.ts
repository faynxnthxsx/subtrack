import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { sendBillReminderEmail, sendWeeklySummaryEmail } from "@/lib/resend";
import { getDaysUntilBilling } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const dailyReminderFunction = inngest.createFunction(
  { id: "daily-bill-reminder", name: "Daily Bill Reminder", trigger: { cron: "0 1 * * *" } } as any,
  async ({ step }: { step: any }) => {
    const subscriptions = await step.run("fetch-subscriptions", async () => {
      return prisma.subscription.findMany({ where: { status: "ACTIVE" } });
    });

    const urgent = (subscriptions as any[]).filter((s: any) => getDaysUntilBilling(s.billingDay) === 3);

    for (const sub of urgent) {
      await step.run(`send-reminder-${sub.id}`, async () => {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.admin.getUserById(sub.userId);
        if (!userData?.user?.email) return;

        await sendBillReminderEmail({
          to: userData.user.email,
          userName: userData.user.user_metadata?.name ?? "คุณผู้ใช้",
          subscriptionName: sub.name,
          amount: sub.amount,
          currency: sub.currency,
          daysLeft: 3,
          billingDay: sub.billingDay,
        });

        await prisma.notificationLog.create({
          data: { userId: sub.userId, type: "REMINDER", subject: `แจ้งเตือน ${sub.name}`, status: "SENT" },
        });
      });
    }

    return { sent: urgent.length };
  }
);

export const weeklySummaryFunction = inngest.createFunction(
  { id: "weekly-summary", name: "Weekly Summary", trigger: { cron: "0 1 * * 1" } } as any,
  async ({ step }: { step: any }) => {
    const users = await step.run("fetch-users", async () => prisma.user.findMany());

    for (const user of (users as any[])) {
      await step.run(`send-summary-${user.id}`, async () => {
        const subscriptions = await prisma.subscription.findMany({ where: { userId: user.id, status: "ACTIVE" } });
        if (subscriptions.length === 0) return;

        const totalMonthly = subscriptions.reduce((s: number, i: any) => s + i.amount, 0);
        const upcomingBills = subscriptions
          .map((s: any) => ({ name: s.name, amount: s.amount, daysLeft: getDaysUntilBilling(s.billingDay) }))
          .filter((s: any) => s.daysLeft <= 7)
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

        const supabase = await createClient();
        const { data: userData } = await supabase.auth.admin.getUserById(user.id);
        if (!userData?.user?.email) return;

        await sendWeeklySummaryEmail({
          to: userData.user.email,
          userName: userData.user.user_metadata?.name ?? "คุณผู้ใช้",
          totalMonthly,
          subscriptionCount: subscriptions.length,
          upcomingBills,
        });

        await prisma.notificationLog.create({
          data: { userId: user.id, type: "WEEKLY_SUMMARY", subject: "สรุปรายจ่ายประจำสัปดาห์", status: "SENT" },
        });
      });
    }

    return { processed: (users as any[]).length };
  }
);