import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";

export const parseEmailFunction = inngest.createFunction(
  {
    id: "parse-email",
    name: "Parse Email with Gemini AI",
    retries: 3,
    trigger: { event: "email/received" },
  } as any,
  async ({ event, step }: { event: any; step: any }) => {
    const { rawEmailId, subject, body } = event.data;

    const extracted = await step.run("extract-with-gemini", async () => {
   //   return await extractEmailData(subject, body);
    });

    if (!extracted) {
      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { parseStatus: "FAILED", parseError: "Gemini could not extract" },
      });
      return { success: false };
    }

    await step.run("save-to-database", async () => {
      const rawEmail = await prisma.rawEmail.findUnique({ where: { id: rawEmailId } });
      if (!rawEmail) throw new Error("RawEmail not found");

      const existing = await prisma.subscription.findFirst({
        where: { userId: rawEmail.userId, name: { contains: extracted.serviceName, mode: "insensitive" } },
      });

      if (existing) {
        await prisma.bill.create({
          data: { subscriptionId: existing.id, amount: extracted.amount, currency: extracted.currency, billingDate: new Date(extracted.billingDate), status: "PAID", rawEmailId },
        });
      } else {
        const sub = await prisma.subscription.create({
          data: { userId: rawEmail.userId, name: extracted.serviceName, category: extracted.category, amount: extracted.amount, currency: extracted.currency, billingDay: new Date(extracted.billingDate).getDate(), status: "ACTIVE" },
        });
        await prisma.bill.create({
          data: { subscriptionId: sub.id, amount: extracted.amount, currency: extracted.currency, billingDate: new Date(extracted.billingDate), status: "PAID", rawEmailId },
        });
      }

      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { parseStatus: "SUCCESS", aiRawResponse: JSON.stringify(extracted) },
      });
    });

    return { success: true };
  }
);