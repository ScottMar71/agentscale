import Stripe from "stripe";
import { PLANS } from "@/lib/constants";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/** Self-serve plans only — Enterprise is custom pricing via sales. */
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "",
  growth: process.env.STRIPE_PRICE_GROWTH ?? "",
} as const;

export type SelfServePlan = keyof typeof STRIPE_PRICE_IDS;

export function planFromPriceId(priceId: string): keyof typeof PLANS | null {
  if (priceId === STRIPE_PRICE_IDS.starter) return "starter";
  if (priceId === STRIPE_PRICE_IDS.growth) return "growth";
  return null;
}
