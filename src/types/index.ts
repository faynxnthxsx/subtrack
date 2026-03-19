// ไฟล์นี้เก็บ Type ทั้งหมดที่ใช้ทั่วทั้ง App

import type {
  Subscription,
  Bill,
  User,
  SubscriptionCategory,
  BillingCycle,
  SubscriptionStatus,
} from "@prisma/client";

// Prisma types
export type { Subscription, Bill, User };

//  Type Extension Merge
export type SubscriptionWithBills = Subscription & {
  bills: Bill[];
};

// Dashboard Stats Type
export type DashboardStats = {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  upcomingBills: UpcomingBill[];
  categoryBreakdown: CategoryStat[];
  monthlyHistory: MonthlyHistory[];
};

export type UpcomingBill = {
  subscriptionId: string;
  name: string;
  amount: number;
  currency: string;
  daysLeft: number;
  billingDate: number;
};

export type CategoryStat = {
  category: string;
  amount: number;
  percent: number;
  color: string;
};

export type MonthlyHistory = {
  month: string;       // "ม.ค.", "ก.พ.", ...
  amount: number;
};

// ===========================
// API Response wrapper
// ===========================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};