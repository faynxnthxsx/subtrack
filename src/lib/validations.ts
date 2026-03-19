// Zod schemas สำหรับ validate ข้อมูลก่อนลง Database
// และ validate ผลลัพธ์จาก AI

import { z } from "zod";

// Subscription
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริการ").max(100),
  category: z.enum([
    "ENTERTAINMENT", "PRODUCTIVITY", "DEVELOPER",
    "DESIGN", "MUSIC", "GAMING", "CLOUD",
    "FINANCE", "HEALTH", "OTHER",
  ]),
  amount: z.number().positive("ราคาต้องมากกว่า 0"),
  currency: z.string().default("THB"),
  billingDay: z.number().min(1).max(31, "วันที่ต้องอยู่ระหว่าง 1-31"),
  billingCycle: z.enum(["MONTHLY", "YEARLY", "WEEKLY"]).default("MONTHLY"),
  website: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema
  .partial()
  .extend({
    status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional(),
  });

// ===========================
// AI Parsed Email (validate ผล AI)
// ===========================
export const parsedEmailSchema = z.object({
  serviceName: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("THB"),
  billingDate: z.string(),   // ISO date
  category: z.enum([
    "ENTERTAINMENT", "PRODUCTIVITY", "DEVELOPER",
    "DESIGN", "MUSIC", "GAMING", "CLOUD",
    "FINANCE", "HEALTH", "OTHER",
  ]),
  confidence: z.number().min(0).max(1),
});

// ===========================
// Postmark Webhook Payload
// ===========================
export const postmarkWebhookSchema = z.object({
  From: z.string().email(),
  To: z.string(),
  Subject: z.string(),
  TextBody: z.string().optional(),
  HtmlBody: z.string().optional(),
  Date: z.string(),
  MessageID: z.string(),
});

// ===========================
// Auth
// ===========================
export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

// ===========================
// Inferred Types จาก Zod
// ===========================
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type ParsedEmailData = z.infer<typeof parsedEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;