import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { parseEmailFunction } from "@/lib/inngest/functions/parseEmail";
import { dailyReminderFunction, weeklySummaryFunction } from "@/lib/inngest/functions/sendReminder";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    parseEmailFunction,
    dailyReminderFunction,
    weeklySummaryFunction,
  ],
});