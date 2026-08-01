import type { ID } from "./common";

export type SubscriptionPlan = "free" | "plus" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type PaymentStatus = "active" | "past_due" | "cancelled" | "trialing" | "paused";

export interface PlanFeature {
  label: string;
  value: string | number | boolean;
  highlight?: boolean;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency: string;
  features: PlanFeature[];
  isPopular?: boolean;
  ctaLabel: string;
}

export interface Subscription {
  id: ID;
  userId: ID;
  plan: SubscriptionPlan;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  nextBillingAmount?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: ID;
  userId: ID;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void" | "uncollectible";
  description?: string;
  pdfUrl?: string;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
}

export interface PaymentMethod {
  id: ID;
  type: "card" | "upi" | "bank";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  upiId?: string;
  isDefault: boolean;
}
